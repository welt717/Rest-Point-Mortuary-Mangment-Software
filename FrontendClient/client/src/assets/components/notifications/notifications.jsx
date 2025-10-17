import React, { useEffect, useState, useRef, useCallback } from "react";
import { Badge, Button, Container, Row, Col, Alert, Modal, Spinner } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUser,
  faBell,
  faBellSlash,
  faEnvelopeOpen,
  faEnvelope,
  faInfoCircle,
  faVolumeUp,
  faCircle,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Updated API endpoint for REST calls
const API_BASE_URL = "http://localhost:5000/api/v1/restpoint";
// WebSocket endpoint
const WS_URL = "ws://localhost:5000";

const notificationStyles = {
  new_body: {
    unreadBg: "#e0f7fa",
    readBg: "#f0f8ff",
    borderColor: "#00bcd4",
    textColor: "#00796b",
    statusColor: "#007bff"
  },
  default: {
    unreadBg: "#f3e5f5",
    readBg: "#f8f0fc",
    borderColor: "#ab47bc",
    textColor: "#6a1b9a",
    statusColor: "#673ab7"
  },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('notificationSoundEnabled') === 'true' ||
    !localStorage.getItem('notificationSoundEnabled')
  );
  const [showSoundInfoAlert, setShowSoundInfoAlert] = useState(
    localStorage.getItem('soundAlertDismissed') !== 'true'
  );

  const audioRef = useRef(null);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const userInteractedRef = useRef(false);

  // Create a custom beep sound using Web Audio API
  const createBeepSound = useCallback((duration = 300, frequency = 800, volume = 0.5) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      
      oscillatorRef.current = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillatorRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillatorRef.current.frequency.value = frequency;
      gainNode.gain.value = volume;
      
      oscillatorRef.current.start();
      oscillatorRef.current.stop(audioContextRef.current.currentTime + duration / 1000);
      
    } catch (error) {
      console.error("Error creating beep sound:", error);
    }
  }, []);

  // Play notification sound - tries both methods
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !userInteractedRef.current) return;

    // First try to play the audio file if available
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio file playback failed, using beep sound instead:", error);
            // If audio file fails, use the beep sound
            createBeepSound();
          });
        }
      } catch (error) {
        console.log("Audio file playback error, using beep sound:", error);
        createBeepSound();
      }
    } else {
      // If no audio file, use the beep sound
      createBeepSound();
    }
  }, [soundEnabled, createBeepSound]);

  // Handle user interaction to enable audio
  const handleUserInteraction = useCallback(() => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log("AudioContext resumed after user interaction");
        }).catch(error => {
          console.error("Error resuming AudioContext:", error);
        });
      }
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    }
  }, []);

  // Set up audio context and user interaction listeners
  useEffect(() => {
    // Initialize audio context
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext created");
    } catch (error) {
      console.error("Audio Context not supported:", error);
    }

    // Set up audio element for custom sound
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    
    // Create a simple beep sound as a fallback
    const beepData = generateBeepSound(800, 300); // 800Hz for 300ms
    const blob = new Blob([beepData], { type: 'audio/wav' });
    audioRef.current.src = URL.createObjectURL(blob);

    // Add user interaction listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      // Cleanup
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, [handleUserInteraction]);

  // Generate beep sound as WAV data
  const generateBeepSound = (frequency, duration) => {
    const sampleRate = 44100;
    const numSamples = duration * sampleRate / 1000;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave
    const amplitude = 0.5;
    for (let i = 0; i < numSamples; i++) {
      const sample = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const intSample = sample > 0 ? sample * 32767 : sample * 32768;
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    return buffer;
  };

  // WebSocket setup
  const setupWebSocket = useCallback(() => {
    try {
      console.log(`Attempting to connect to WebSocket: ${WS_URL}`);
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected successfully.");
        setSocketConnected(true);
        setError("");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const newNotification = JSON.parse(event.data);
          if (newNotification && newNotification.message) {
            console.log("⚡ New notification received via WebSocket:", newNotification);

            setNotifications(prevNotifications => [
              { ...newNotification, is_read: 0, created_at: new Date().toISOString() },
              ...prevNotifications
            ]);

            setUnreadCount(prev => prev + 1);

            // Force sound to play for new notifications
            if (soundEnabled) {
              playNotificationSound();
            }
          }
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);
        setSocketConnected(false);
        setTimeout(setupWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setSocketConnected(false);
        setError("WebSocket connection error. Retrying...");
      };
    } catch (error) {
      console.error("❌ WebSocket setup error:", error);
      setSocketConnected(false);
      setError("Failed to initialize WebSocket connection. Retrying...");
      setTimeout(setupWebSocket, 5000);
    }
  }, [soundEnabled, playNotificationSound]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = 'peter'; // Replace with actual token retrieval

      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const validNotifications = response.data.data
          .filter(n => n?.id && n?.message)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setNotifications(validNotifications);
        setUnreadCount(validNotifications.filter(n => !n.is_read).length);
      } else {
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial setup
  useEffect(() => {
    fetchNotifications();
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchNotifications, setupWebSocket]);

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    const result = await Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingIds(prev => [...prev, notificationId]);
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      setNotifications(prev => {
        const updatedNotifications = prev.filter(n => n.id !== notificationId);
        const deletedItemWasUnread = prev.find(n => n.id === notificationId && !n.is_read);
        if (deletedItemWasUnread) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        return updatedNotifications;
      });

      Swal.fire("Deleted!", "Notification has been deleted.", "success");
    } catch (err) {
      console.error("Deletion failed:", err);
      Swal.fire("Error!", "Failed to delete notification.", "error");
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== notificationId));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);

      Swal.fire("Success!", "All notifications marked as read.", "success");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      Swal.fire("Error!", "Failed to mark all notifications as read.", "error");
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/mark-read`, { is_read: true }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);

    if (!notification.is_read) {
      markNotificationAsRead(notification.id);
    }
  };

  // Test sound function
  const handleTestSound = () => {
    if (!userInteractedRef.current) {
      Swal.fire({
        title: "Allow Sound",
        text: "Please interact with the page first to enable sound",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }
    
    playNotificationSound();
  };

  // Toggle sound
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('notificationSoundEnabled', newState.toString());
    
    if (newState && userInteractedRef.current) {
      playNotificationSound();
    }
  };

  // Dismiss sound info alert
  const dismissSoundInfoAlert = () => {
    setShowSoundInfoAlert(false);
    localStorage.setItem('soundAlertDismissed', 'true');
  };

  // Notification Item component
  const NotificationItem = ({ notification }) => {
    const styleConfig = notificationStyles[notification.type] || notificationStyles.default;
    const isUnread = !notification.is_read;
    const isDeleting = deletingIds.includes(notification.id);

    return (
      <div className="mb-3">
        <div
          className="rounded p-3 position-relative shadow-sm border border-opacity-25"
          style={{
            backgroundColor: isUnread ? styleConfig.unreadBg : styleConfig.readBg,
            borderColor: isUnread ? styleConfig.borderColor : '#ccc',
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            transform: 'scale(1)',
            boxShadow: isUnread
              ? `0 5px 15px rgba(0,0,0,.1), 0 0 0 3px ${styleConfig.statusColor}80`
              : '0 2极 8px rgba(0,0,0,.08)',
            overflow: 'hidden',
            borderLeft: `6px solid ${isUnread ? styleConfig.statusColor : '#28a745'}`,
          }}
          onClick={() => handleNotificationClick(notification)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = isUnread ? `0 6px 20px rgba(0,0,0,.15), 0 0 0 4px ${styleConfig.statusColor}a0` : '0 3px 10px rgba(0,0,0,.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = isUnread ? `0 5px 15px rgba(0,0,0,.1), 0 0 0 3px ${styleConfig.statusColor}80` : '0 2px 8px rgba(0,0,0,.08)'; }}
        >
          <div className="position-absolute top-0 end-0 mt-2 me-2">
            <FontAwesomeIcon
              icon={isUnread ? faEnvelope : faEnvelopeOpen}
              className={isUnread ? "text-primary" : "text-success"}
              size="sm"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge
              pill
              style={{
                backgroundColor: styleConfig.borderColor,
                color: "white",
                fontSize: "0.7rem",
                padding: "0.35em 0.75em",
              }}
            >
              {notification.type ? notification.type.toUpperCase().replace(/_/g, " ") : "GENERAL"}
            </Badge>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>

          <div
            style={{
              color: styleConfig.textColor,
              fontSize: "0.9rem",
              fontWeight: isUnread ? '600' : 'normal',
              paddingRight: '30px'
            }}
          >
            {notification.message}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted small">
              <FontAwesomeIcon icon={faUser} className="me-1" />
              Deceased ID: {notification.deceased_id || "N/A"}
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0 d-flex align-items-center"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(notification.id);
              }}
              disabled={isDeleting}
              title="Delete Notification"
            >
              {isDeleting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="min-vh-100 bg-light p-3">
      <Row className="mb-3">
        <Col>
          <h2 className="d-flex justify-content-between align-items-center">
            <span className="text-primary">Mortuary Notifications</span>
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant={soundEnabled ? "outline-success" : "outline-warning"}
                size="sm"
                onClick={toggleSound}
                title={soundEnabled ? "Disable Notification Sounds" : "Enable Notification Sounds"}
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px', borderWidth: '2px' }}
              >
                <FontAwesomeIcon icon={soundEnabled ? faBell : faBellSlash} size="lg" />
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={handleTestSound}
                title="Test Notification Sound"
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
              >
                <FontAwesomeIcon icon={faVolumeUp} size="lg" />
              </Button>
              <Badge pill bg="danger" className="fs-6 px-3 py-2">
                {unreadCount} Unread
              </Badge>
              <Badge pill bg={socketConnected ? "success" : "secondary"} className="fs-6 px-3 py-2">
                <FontAwesomeIcon icon={faCircle} className="me-1" size="xs" />
                {socketConnected ? "Live" : "Offline"}
              </Badge>
            </div>
          </h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Button variant="primary" size="md" onClick={markAllAsRead} disabled={unreadCount === 0} className="me-2">
            Mark All as Read
          </Button>
          <Button variant="outline-secondary" size="md" onClick={fetchNotifications}>
            <FontAwesomeIcon icon={faInfoCircle} className="me-1"/> Refresh List
          </Button>
        </Col>
      </Row>

      {showSoundInfoAlert && (
        <Alert variant="primary" onClose={dismissSoundInfoAlert} dismissible className="mb-4 shadow-sm">
          <Alert.Heading className="d-flex align-items-center">
            <FontAwesomeIcon icon={faBell} className="me-2 fs-5" />
            <span className="text-primary">Notification Sounds</span>
          </Alert.Heading>
          <p className="mb-0">
            Click anywhere on the page to enable notification sounds. Browser security requires user interaction before playing sounds.
          </p>
          <hr className="my-3"/>
          <div className="d-flex justify-content-end">
            <Button onClick={dismissSoundInfoAlert} variant="outline-primary" size="sm">
              Got It!
            </Button>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="py-2 d-flex justify-content-between align-items-center">
          <div>
            <FontAwesomeIcon icon={faTimes} className="me-2" /> {error}
          </div>
          <Button variant="outline-danger" size="sm" onClick={fetchNotifications}>
            Retry
          </Button>
        </Alert>
      )}

      <Row>
        <Col md={12}>
          {loading ? (
            <div className="text-center py-5 my-5 rounded-3 bg-white shadow-sm">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 fs-5">Loading notifications...</p>
            </div>
          ) : (
            <div
              className="bg-white rounded-3 shadow-lg p-3"
              style={{ maxHeight: "75vh", overflowY: "auto", minHeight: "300px" }}
            >
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center text-muted py-5 my-5">
                  <FontAwesomeIcon icon={faBell} size="4x" className="mb-3 text-secondary opacity-50" />
                  <h5 className="mt-3 fw-normal">No new notifications</h5>
                  <p className="text-muted">Your notification center is clear!</p>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-primary text-white rounded-top">
          <Modal.Title>
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" /> Notification Details
          </Modal.Title>
          <Button variant="close" onClick={() => setShowDetailModal(false)} className="btn-close btn-close-white"/>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedNotification ? (
            <>
              <p className="mb-2"><strong>Type:</strong> <Badge pill bg={notificationStyles[selectedNotification.type]?.borderColor || notificationStyles.default.borderColor}>{selectedNotification.type?.toUpperCase().replace(/_/g, " ") || "GENERAL"}</Badge></p>
              <p className="mb-2"><strong>Deceased ID:</strong> <span className="fw-bold">{selectedNotification.deceased_id || "N/A"}</span></p>
              <p className="mb-2"><strong>Received:</strong> {new Date(selectedNotification.created_at).toLocaleString()}</p>
              <hr className="my-3"/>
              <p className="fs-5"><strong>Message:</strong></p>
              <p className="lead text-muted">{selectedNotification.message}</p>
            </>
          ) : (
            <p className="text-center text-muted">Loading details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notifications;