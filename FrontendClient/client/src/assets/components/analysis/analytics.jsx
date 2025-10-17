import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Box,
  useTheme,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  Chip,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  CardHeader,
  CardActions,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  HelpOutline as UnknownIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Dashboard as DashboardIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon,
  Map as MapIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingDown as TrendingDownIcon,
  Equalizer as EqualizerIcon,
  PieChart as PieChartIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import ReportGenerator from '../reportGenarte';

// --- Styled Components ---
const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(0),
  backgroundColor: theme.palette.grey[50],
  minHeight: '100vh',
  fontFamily: 'Inter, sans-serif',
}));

const HeaderAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({

  minWidth: '1000px',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
  },
}));

const StyledChartCard = styled(StyledCard)(({ theme }) => ({
  width: '100%',
    minWidth: '900px',
}));

const AnalyticsValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  marginTop: theme.spacing(1),
  textAlign: 'left',
  lineHeight: 1.1,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const AnalyticsLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'left',
  marginTop: theme.spacing(0.5),
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '380px',


  width: '100%',
  position: 'relative',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '1.2rem',
}));

const StatBadge = styled(Chip)(({ theme, trend }) => ({
  fontWeight: 700,
  backgroundColor: trend === 'up'
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.error.main, 0.1),
  color: trend === 'up'
    ? theme.palette.success.main
    : theme.palette.error.main,
  border: trend === 'up'
    ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
    : `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
}));

const RevenueCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: '16px',
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const CoffinInventoryCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  borderRadius: '16px',
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

// --- Custom Recharts components ---
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: theme.shadows[4] }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          {label}
        </Typography>
        {payload.map((pld, index) => (
          <Typography key={index} variant="body2" color="textPrimary">
            {`${pld.name}: Ksh ${pld.value.toLocaleString()}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StyledBarChart = ({ data, title, icon, dataKey = "value", color }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartContainer>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <ChartTitle variant="h6">
          {title}
        </ChartTitle>
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: isSmallScreen ? 0 : 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            angle={isSmallScreen ? -45 : 0}
            textAnchor={isSmallScreen ? "end" : "middle"}
            height={isSmallScreen ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={dataKey}
            name="Count"
            radius={[8, 8, 0, 0]}
            barSize={isSmallScreen ? 20 : 40}
            fill={color || theme.palette.primary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const EnhancedPieChart = ({ data, title, icon }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ChartContainer>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <ChartTitle variant="h6">
          {title}
        </ChartTitle>
      </Box>
      <Box display="flex" width="100%" height="90%" alignItems="center">
        <Box flex={1} height="100%">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                paddingAngle={2}
                cornerRadius={8}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [`Ksh ${value.toLocaleString()} (${(props.payload.percent * 100).toFixed(1)}%)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box flex={1} pl={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            {data.map((entry, index) => (
              <Box key={index} display="flex" alignItems="center">
                <Box
                  width={12}
                  height={12}
                  bgcolor={COLORS[index % COLORS.length]}
                  mr={1}
                  borderRadius="2px"
                />
                <Typography variant="body2" flexGrow={1} fontSize="0.8rem" fontWeight="500">
                  {entry.name}
                </Typography>
                <Typography variant="body2" fontWeight="700" fontSize="0.8rem">
                  Ksh {entry.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
};

const RevenueTrendChart = ({ data, title, icon }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartContainer>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <ChartTitle variant="h6">
          {title}
        </ChartTitle>
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: isSmallScreen ? 0 : 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            angle={isSmallScreen ? -45 : 0}
            textAnchor={isSmallScreen ? "end" : "middle"}
            height={isSmallScreen ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            tickFormatter={(value) => `Ksh ${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            fill={alpha(theme.palette.success.main, 0.2)}
            stroke={theme.palette.success.main}
            strokeWidth={2}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const MonthlyRevenueChart = ({ data, title, icon }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartContainer>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <ChartTitle variant="h6">
          {title}
        </ChartTitle>
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: isSmallScreen ? 0 : 20, bottom: 10 }}
          barSize={35}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            angle={isSmallScreen ? -45 : 0}
            textAnchor={isSmallScreen ? "end" : "middle"}
            height={isSmallScreen ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            tickFormatter={(value) => `Ksh ${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            name="Revenue"
            radius={[8, 8, 0, 0]}
            fill={theme.palette.primary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const CoffinSalesBarChart = ({ data, title, icon }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartContainer>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <ChartTitle variant="h6">
          {title}
        </ChartTitle>
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: isSmallScreen ? 0 : 20, bottom: 10 }}
          barSize={35}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            angle={isSmallScreen ? -45 : 0}
            textAnchor={isSmallScreen ? "end" : "middle"}
            height={isSmallScreen ? 60 : 30}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="sales"
            name="Sales"
            radius={[8, 8, 0, 0]}
            fill={theme.palette.secondary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const DeathSourceIcon = ({ source }) => {
  const iconProps = { fontSize: "small", sx: { mr: 1 } };
  switch (source.toLowerCase()) {
    case 'hospital':
      return <HospitalIcon color="primary" {...iconProps} />;
    case 'home':
      return <HomeIcon color="secondary" {...iconProps} />;
    case 'accident':
      return <CarIcon color="error" {...iconProps} />;
    default:
      return <UnknownIcon color="action" {...iconProps} />;
  }
};

// --- Main Component ---
function Analytics(props) {
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isCoffinDialogOpen, setIsCoffinDialogOpen] = useState(false);
  const [newCoffin, setNewCoffin] = useState({
    type: '',
    material: '',
    price: '',
    quantity: '',
    supplier: ''
  });
  const theme = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [coffinInventory, setCoffinInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleClick = () => {
    setIsReportVisible(true);
  };

  const handleCloseReport = () => {
    setIsReportVisible(false);
  };

  const handleOpenCoffinDialog = () => {
    setIsCoffinDialogOpen(true);
  };

  const handleCloseCoffinDialog = () => {
    setIsCoffinDialogOpen(false);
    setNewCoffin({
      type: '',
      material: '',
      price: '',
      quantity: '',
      supplier: ''
    });
  };

  const handleAddCoffin = () => {
    if (newCoffin.type && newCoffin.material && newCoffin.price && newCoffin.quantity) {
      const newItem = {
        id: Date.now(),
        ...newCoffin,
        price: parseFloat(newCoffin.price),
        quantity: parseInt(newCoffin.quantity),
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setCoffinInventory([...coffinInventory, newItem]);
      handleCloseCoffinDialog();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/restpoint/moltuary-analytics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalyticsData(data);

        // Mock coffin inventory data
        const mockCoffinData = [
          { id: 1, type: 'Standard Adult', material: 'Wood', price: 25000, quantity: 15, supplier: 'WoodCraft Ltd', dateAdded: '2023-10-15' },
          { id: 2, type: 'Premium Adult', material: 'Mahogany', price: 45000, quantity: 8, supplier: 'Elegant Coffins', dateAdded: '2023-11-02' },
          { id: 3, type: 'Child Coffin', material: 'Pine', price: 18000, quantity: 12, supplier: 'WoodCraft Ltd', dateAdded: '2023-09-20' },
          { id: 4, type: 'Oversized', material: 'Metal', price: 60000, quantity: 5, supplier: 'MetalWorks Co', dateAdded: '2023-12-05' },
          { id: 5, type: 'Eco-Friendly', material: 'Bamboo', price: 35000, quantity: 10, supplier: 'Green Solutions', dateAdded: '2023-11-18' },
        ];
        setCoffinInventory(mockCoffinData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <DashboardContainer maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
          flexDirection="column"
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={3} color="textSecondary">
            Loading analytics data...
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer maxWidth="xl">
        <Box my={4}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
            sx={{ borderRadius: '12px' }}
          >
            Error loading data: {error}
          </Alert>
        </Box>
      </DashboardContainer>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardContainer maxWidth="xl">
        <Box my={4}>
          <Alert severity="warning" sx={{ borderRadius: '12px' }}>
            No data available
          </Alert>
        </Box>
      </DashboardContainer>
    );
  }

  // Prepare data for charts
  const deathsByCounty = analyticsData.deathsByCounty
    ? analyticsData.deathsByCounty.map((item) => ({
      name: item.county ? item.county.trim() : 'Unknown',
      value: item.count || 0,
    })).sort((a, b) => b.value - a.value)
    : [];

  const deathSources = analyticsData.deathSources
    ? Object.entries(analyticsData.deathSources)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        value: value,
      }))
    : [];

  const monthlyTrends = analyticsData.monthlyTrends
    ? analyticsData.monthlyTrends
      .filter(item => item.month_year)
      .map(item => ({
        name: item.month_year,
        value: item.count || 0,
      }))
    : [];

  // Generate revenue data (mock data for demonstration)
  const revenueData = [
    { name: 'Jan', revenue: 125000, target: 120000 },
    { name: 'Feb', revenue: 145000, target: 140000 },
    { name: 'Mar', revenue: 165000, target: 160000 },
    { name: 'Apr', revenue: 155000, target: 165000 },
    { name: 'May', revenue: 175000, target: 170000 },
    { name: 'Jun', revenue: 185000, target: 180000 },
    { name: 'Jul', revenue: 195000, target: 190000 },
    { name: 'Aug', revenue: 205000, target: 200000 },
    { name: 'Sep', revenue: 215000, target: 210000 },
    { name: 'Oct', revenue: 225000, target: 220000 },
    { name: 'Nov', revenue: 235000, target: 230000 },
    { name: 'Dec', revenue: 245000, target: 240000 },
  ];

  // Monthly revenue data for the new chart
  const monthlyRevenueData = [
    { name: 'Jan', revenue: 1250000 },
    { name: 'Feb', revenue: 1450000 },
    { name: 'Mar', revenue: 1650000 },
    { name: 'Apr', revenue: 1550000 },
    { name: 'May', revenue: 1750000 },
    { name: 'Jun', revenue: 1850000 },
    { name: 'Jul', revenue: 1950000 },
    { name: 'Aug', revenue: 2050000 },
    { name: 'Sep', revenue: 2150000 },
    { name: 'Oct', revenue: 2250000 },
    { name: 'Nov', revenue: 2350000 },
    { name: 'Dec', revenue: 2450000 },
  ];

  // Coffin inventory data
  const coffinSalesData = [
    { name: 'Standard Adult', sales: 45, revenue: 1125000 },
    { name: 'Premium Adult', sales: 28, revenue: 1260000 },
    { name: 'Child Coffin', sales: 32, revenue: 576000 },
    { name: 'Oversized', sales: 12, revenue: 720000 },
    { name: 'Eco-Friendly', sales: 25, revenue: 875000 },
  ];

  const coffinRevenueByMonth = [
    { name: 'Jan', revenue: 850000 },
    { name: 'Feb', revenue: 920000 },
    { name: 'Mar', revenue: 1050000 },
    { name: 'Apr', revenue: 980000 },
    { name: 'May', revenue: 1120000 },
    { name: 'Jun', revenue: 1250000 },
    { name: 'Jul', revenue: 1320000 },
    { name: 'Aug', revenue: 1450000 },
    { name: 'Sep', revenue: 1380000 },
    { name: 'Oct', revenue: 1520000 },
    { name: 'Nov', revenue: 1650000 },
    { name: 'Dec', revenue: 1780000 },
  ];

  const totalDeaths = deathsByCounty.reduce((sum, item) => sum + item.value, 0);
  const avgStayDays = analyticsData.averageStayDays || 0;
  const postmortems = analyticsData.postmortems || 0;
  const unclaimedBodies = analyticsData.unclaimedBodies || 0;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const avgMonthlyRevenue = totalRevenue / revenueData.length;
  const revenueGrowth = ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / revenueData[0].revenue) * 100;

  // Coffin inventory stats
  const totalCoffins = coffinInventory.reduce((sum, item) => sum + item.quantity, 0);
  const coffinInventoryValue = coffinInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const coffinTypes = [...new Set(coffinInventory.map(item => item.type))].length;

  if (isReportVisible) {
    return <ReportGenerator onClose={handleCloseReport} />;
  }

  const renderAnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Total Deaths</AnalyticsLabel>
                    <AnalyticsValue>{totalDeaths.toLocaleString()}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label="+12% this month" size="small" trend="up" />
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mr: 2 }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Avg. Stay Days</AnalyticsLabel>
                    <AnalyticsValue>{avgStayDays.toFixed(1)}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label="-3% this month" size="small" trend="down" />
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2 }}>
                    <HospitalIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Postmortems</AnalyticsLabel>
                    <AnalyticsValue>{postmortems.toLocaleString()}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label="+8% this month" size="small" trend="up" />
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <RevenueCard>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Total Revenue</AnalyticsLabel>
                    <AnalyticsValue>Ksh {totalRevenue.toLocaleString()}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge
                  label={`${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% growth`}
                  size="small"
                  trend={revenueGrowth > 0 ? "up" : "down"}
                />
              </CardContent>
            </RevenueCard>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledChartCard>
              <CardContent>
                <RevenueTrendChart
                  data={revenueData}
                  title="Monthly Revenue Trends"
                  icon={<TrendingUpIcon color="success" />}
                />
              </CardContent>
            </StyledChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledChartCard>
              <CardContent>
                <MonthlyRevenueChart
                  data={monthlyRevenueData}
                  title="Coffin Revenue by Month"
                  icon={<MoneyIcon color="success" />}
                />
              </CardContent>
            </StyledChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledChartCard>
              <CardContent>
                <StyledBarChart
                  data={deathsByCounty.slice(0, 5)}
                  title="Top 5 Death Registrations by County"
                  icon={<MapIcon color="primary" />}
                />
              </CardContent>
            </StyledChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledChartCard>
              <CardContent>
                <EnhancedPieChart
                  data={deathSources}
                  title="Death Sources Breakdown"
                  icon={<PieChartIcon color="secondary" />}
                />
              </CardContent>
            </StyledChartCard>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Unclaimed Bodies Table */}
      <Grid item xs={12}>
        <StyledCard>
          <CardHeader
            title="Unclaimed Bodies"
            subheader="A list of bodies that have not been claimed by their next of kin."
            titleTypographyProps={{ fontWeight: 700 }}
          />
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Body ID</TableCell>
                  <TableCell>Date Admitted</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Days Since Admission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
             {Array.isArray(unclaimedBodies) && unclaimedBodies.length > 0 ? (
  unclaimedBodies.map((body, index) => (
                    <TableRow key={index}>
                      <TableCell>{body.body_id}</TableCell>
                      <TableCell>{body.date_admitted}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <DeathSourceIcon source={body.source} />
                          <Typography variant="body2">{body.source}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{body.days_since_admission}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No unclaimed bodies found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );

  const renderInventoryDashboard = () => (
    <Grid container spacing={3}>
      {/* Coffin Inventory Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <CoffinInventoryCard>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mr: 2 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Total Coffins</AnalyticsLabel>
                    <AnalyticsValue>{totalCoffins}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label={`${coffinTypes} types`} size="small" trend="up" />
              </CardContent>
            </CoffinInventoryCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CoffinInventoryCard>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 2 }}>
                    <AccountBalanceIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Inventory Value</AnalyticsLabel>
                    <AnalyticsValue>Ksh {coffinInventoryValue.toLocaleString()}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label="In stock" size="small" trend="up" />
              </CardContent>
            </CoffinInventoryCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CoffinInventoryCard>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <AnalyticsLabel>Coffin Revenue</AnalyticsLabel>
                    <AnalyticsValue>Ksh {coffinSalesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}</AnalyticsValue>
                  </Box>
                </Box>
                <StatBadge label="+15% this month" size="small" trend="up" />
              </CardContent>
            </CoffinInventoryCard>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Inventory Charts */}
      <Grid item xs={12} md={6}>
        <StyledChartCard>
          <CardContent>
            <CoffinSalesBarChart
              data={coffinSalesData}
              title="Coffin Sales by Type"
              icon={<BarChartIcon color="secondary" />}
            />
          </CardContent>
        </StyledChartCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledChartCard>
          <CardContent>
            <MonthlyRevenueChart
              data={coffinRevenueByMonth}
              title="Monthly Coffin Revenue"
              icon={<MoneyIcon color="success" />}
            />
          </CardContent>
        </StyledChartCard>
      </Grid>

      {/* Coffin Inventory Table */}
      <Grid item xs={12}>
        <StyledCard>
          <CardHeader
            title="Current Coffin Inventory"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCoffinDialog}
                sx={{ borderRadius: '8px' }}
              >
                Add Coffin
              </Button>
            }
          />
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Type</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Price (Ksh)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Date Added</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coffinInventory.length > 0 ? (
                  coffinInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.price.toLocaleString()}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.dateAdded}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No coffins in inventory.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1 }}>
        <HeaderAppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ mr: 1 }} />
              Mortuary Analytics Dashboard
            </Typography>
          </Toolbar>
        </HeaderAppBar>
      </Box>

      <DashboardContainer maxWidth="xl">
        <Box sx={{ py: 3, px: 3 }}>
          {/* Header Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {tabValue === 0 ? 'Analytics Overview' : 'Inventory Management'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {tabValue === 0 ? 'Comprehensive analysis of mortuary operations and financial performance' : 'Manage and track your coffin inventory and sales'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <DatePicker
                label="Filter by date"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<PdfIcon />}
                sx={{ borderRadius: '8px', px: 3 }}
                onClick={handleClick}
              >
                Generate Report
              </Button>
            </Stack>
          </Box>

          {/* Tab Navigation */}
          <Paper sx={{ mb: 4, borderRadius: '12px', boxShadow: theme.shadows[1] }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
              <Tab label="Inventory" icon={<InventoryIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Main Content based on Tab */}
          {tabValue === 0 && renderAnalyticsDashboard()}
          {tabValue === 1 && renderInventoryDashboard()}
        </Box>
      </DashboardContainer>
      
      {/* Add Coffin Dialog */}
      <Dialog open={isCoffinDialogOpen} onClose={handleCloseCoffinDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Coffin
          <IconButton onClick={handleCloseCoffinDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Type"
              value={newCoffin.type}
              onChange={(e) => setNewCoffin({ ...newCoffin, type: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Material"
              value={newCoffin.material}
              onChange={(e) => setNewCoffin({ ...newCoffin, material: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Price"
              type="number"
              value={newCoffin.price}
              onChange={(e) => setNewCoffin({ ...newCoffin, price: e.target.value })}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">Ksh</InputAdornment>,
              }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={newCoffin.quantity}
              onChange={(e) => setNewCoffin({ ...newCoffin, quantity: e.target.value })}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Supplier"
              value={newCoffin.supplier}
              onChange={(e) => setNewCoffin({ ...newCoffin, supplier: e.target.value })}
              fullWidth
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCoffinDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAddCoffin} variant="contained" color="primary">
            Add Coffin
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default Analytics;