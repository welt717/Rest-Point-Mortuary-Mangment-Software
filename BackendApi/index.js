const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const hpp = require('hpp');

const http = require('http');
const cron = require('node-cron');
const path = require('path');

const fs = require('fs');
require('source-map-support').install();

const { Server: SocketIOServer } = require('socket.io'); // Socket.IO import

// --- Local helpers ---
const { initDB, safeQuery } = require('./configurations/sqlConfig/db');
const { getHealthStatus } = require('./utilities/heathWarning/health');
const { updateMortuaryCharges } = require('./helpers/aurtoChargeCalculations');
const { handleDeceasedNotifications } = require('./controllers/notifications/notifications');
const startEmailNotificationCron = require('./helpers/sendNotificationEmail');
const { sendDeceasedWhatsAppNotifications } = require('./controllers/updates/sendNotificationUpdates');
const { scheduleBackups } = require("./controllers/backups/backup");
const { createActiveMonitoringAssist } = require('./controllers/ActiveMonitoringAssist/active');

const app = express();
const HOST = '0.0.0.0';
const PORT = 5000;

// ----------------- Main Server Error Logging -----------------
const mainLogDir = path.resolve(__dirname, './logs');
if (!fs.existsSync(mainLogDir)) fs.mkdirSync(mainLogDir, { recursive: true });
const mainErrorLogFile = path.join(mainLogDir, 'mainServerErrors.log');

function logMainServerError(err, context = '') {
  const timestamp = new Date().toISOString();
  const errorMsg = `[${timestamp}] ${context ? context + ' - ' : ''}Error: ${err.message || err}\nStack:\n${err.stack || ''}\n\n`;
  fs.appendFile(mainErrorLogFile, errorMsg, fsErr => {
    if (fsErr) console.error('Failed to write to main server error log:', fsErr);
  });
}

// ----------------- Security & Performance -----------------
app.use(helmet());
app.use(hpp());
app.use(compression({ level: 3, threshold: 1024 }));

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) return callback(new Error(`CORS origin ${origin} not allowed`), false);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/coffins', express.static('uploads/coffins'));

// ----------------- DB Initialization -----------------
async function startDB(retries = 5, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await initDB();
      console.log(`✅ Database initialized on attempt ${i}`);
      return;
    } catch (err) {
      logMainServerError(err, `DB connection attempt ${i} failed`);
      if (i < retries) await new Promise(res => setTimeout(res, delay));
      else process.exit(1);
    }
  }
}

// ----------------- HTTP + Socket.IO -----------------
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', socket => {
  console.log('Socket.IO client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});

// Broadcast active monitoring alerts via Socket.IO
function broadcastActiveMonitoringAlert(alert) {
  io.emit('active_monitoring_alert', alert);
}

// Initialize active monitoring with Socket.IO broadcast function
const { activeMonitoringAssist } = createActiveMonitoringAssist(broadcastActiveMonitoringAlert);

// ----------------- Real-Time Notification Polling -----------------
let lastNotificationTime = new Date(0);

async function initializeLastNotificationTime() {
  try {
    const result = await safeQuery(`SELECT created_at FROM notifications ORDER BY created_at DESC LIMIT 1`);
    if (result.length > 0) lastNotificationTime = new Date(result[0].created_at);
  } catch (err) {
    logMainServerError(err, 'Failed to initialize last notification time');
  }
}

async function pollNotifications() {
  try {
    const timestamp = lastNotificationTime.toISOString().slice(0, 19).replace('T', ' ');
    const newNotifications = await safeQuery(`SELECT * FROM notifications WHERE created_at > '${timestamp}' ORDER BY created_at ASC`);
    if (newNotifications.length > 0) {
      lastNotificationTime = new Date(newNotifications[newNotifications.length - 1].created_at);
      newNotifications.forEach(notification => {
        // Since native ws is removed, either:
        // - remove broadcastNotification, or
        // - optionally broadcast via Socket.IO as well
        // Here, broadcast via Socket.IO under a separate event:
        io.emit('notification', notification);
        console.log('📢 Broadcasted notification:', notification.message || notification);
      });
    }
  } catch (err) {
    logMainServerError(err, 'Error polling notifications');
  }
}

// ----------------- Background Tasks -----------------
async function startBackgroundTasks() {
  try { await scheduleBackups(); } catch (err) { logMainServerError(err, 'Backup scheduler failed'); }
  try { await handleDeceasedNotifications(); } catch (err) { logMainServerError(err, 'Deceased notifications failed'); }
  try { if (typeof startEmailNotificationCron === 'function') startEmailNotificationCron(); } catch (err) { logMainServerError(err, 'Email cron failed'); }

  cron.schedule('0 0 * * *', async () => {
    console.log('Running deceased WhatsApp notifications cron job:', new Date());
    try { await sendDeceasedWhatsAppNotifications(); } catch (err) { logMainServerError(err, 'WhatsApp notification cron failed'); }
  });

  await initializeLastNotificationTime();
  setInterval(pollNotifications, 5000);
}

// ----------------- Routes -----------------
app.get('/health', async (req, res) => {
  try {
    const healthStatus = await getHealthStatus();
    res.status(200).json(healthStatus);
  } catch (err) {
    logMainServerError(err, 'Health check failed');
    res.status(500).json({ message: '❌ Health check failed', error: err.message });
  }
});

app.get('/api/v1/restpoint/notifications', async (req, res) => {
  try {
    const notifications = await safeQuery(`SELECT * FROM notifications ORDER BY created_at DESC`);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    logMainServerError(err, 'Fetching notifications failed');
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// ----------------- Cron for Mortuary Charges -----------------
cron.schedule('*/5 * * * *', async () => {
  try {
    await updateMortuaryCharges();
  } catch (err) {
    logMainServerError(err, 'Mortuary charge cron failed');
    // Since native ws removed, you might want to broadcast via Socket.IO instead or log only
    io.emit('system_error', { message: 'Mortuary charge update failed', details: err.message });
  }
});

app.get('/ping', (req, res) => res.json({ message: 'pong' }));

setTimeout(async () => {
  try {
    await updateMortuaryCharges();
  } catch (err) {
    logMainServerError(err, 'Initial mortuary charge update failed');
  }
}, 15 * 60 * 1000);

// ----------------- Import Routes -----------------
const routeBase = '/api/v1/restpoint';
app.use(routeBase, require('./routes/deceasedRoutes'));
app.use(routeBase, require('./routes/moltuaryRoutes'));
app.use(routeBase, require('./routes/visitorsRoutes'));
app.use(routeBase, require('./routes/coffinRoutes'));
app.use(routeBase, require('./routes/userRoutes'));
app.use(routeBase, require('./routes/analyticsRoutes'));
app.use(routeBase, require('./routes/deviceRoutes'));
app.use(routeBase, require('./routes/driverDispatchRoutes'));
app.use(routeBase, require('./routes/notifications'));
app.use(routeBase, require('./routes/burilNotifcationRoute'));
app.use(routeBase, require('./routes/portal'));
app.use(routeBase, require('./routes/uploadDocument'));
app.use(routeBase, require('./routes/qrCodes'));
app.use(routeBase, require('./routes/paymentHistory'));
app.use(routeBase, require('./routes/checkOut'));
app.use(routeBase, require('./routes/coldRoom'));
app.use(routeBase, require('./routes/tagRoutes'));
app.use(routeBase, require('./routes/invoice'));
app.use(routeBase, require('./routes/hearseroutes'));
app.use(routeBase, require('./routes/bookhearse'));


// ----------------- 404 -----------------
app.use((req, res) => res.status(404).json({ message: '❌ Route not found' }));

// ----------------- Global Error Handling -----------------
process.on('uncaughtException', err => logMainServerError(err, 'UNCAUGHT EXCEPTION'));
process.on('unhandledRejection', reason => logMainServerError(reason, 'UNHANDLED REJECTION'));

// ----------------- Start Server -----------------
(async () => {
  await startDB();
  await startBackgroundTasks();
  await scheduleBackups();

  server.listen(PORT, HOST, () => {
    activeMonitoringAssist(); // Start the active monitoring loop
    console.log({ message: '✅ App & Socket.IO server running', host: HOST, port: PORT, status: true });
  });
})();
