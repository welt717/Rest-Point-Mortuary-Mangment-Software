import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Alert, 
  Spinner,
  Card,
  Badge,
  Modal,
  Button,
  Form
} from 'react-bootstrap';

// API Service Layer
const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

const bookingService = {
  getBookings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hearse-bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  assignDriver: async (bookingId, driverId, hearseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/assign-driver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          driver_id: parseInt(driverId),
          hearse_id: parseInt(hearseId)
        })
      });
      if (!response.ok) throw new Error('Failed to assign driver');
      return await response.json();
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return await response.json();
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  postponeBooking: async (bookingId, postponeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hearse-bookings/${bookingId}/postpone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postponeData)
      });
      if (!response.ok) throw new Error('Failed to postpone booking');
      return await response.json();
    } catch (error) {
      console.error('Error postponing booking:', error);
      throw error;
    }
  }
};

const driverService = {
  getDrivers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/all-drivers`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      const data = await response.json();
      return data.drivers || data || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [
        {
          driver_id: 1,
          driver_name: "John Mwangi",
          driver_phone: "0712345678",
          license_number: "DLK-001-KEN",
          availability_status: "available"
        },
        {
          driver_id: 2,
          driver_name: "Peter Kamau",
          driver_phone: "0723456789",
          license_number: "DLK-002-KEN",
          availability_status: "available"
        }
      ];
    }
  }
};

// Utility Functions
const utils = {
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getUpdatedBy: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).name : 'mumo';
    } catch {
      return 'mumo';
    }
  },

  getBranchId: () => {
    try {
      const branch = localStorage.getItem('branch');
      return branch ? JSON.parse(branch).id : '1';
    } catch {
      return '1';
    }
  },

  generateBookingId: (bookingId) => {
    return `BK-${String(bookingId).padStart(4, '0')}`;
  }
};

// Stats Component
const BookingStats = ({ bookings }) => {
  const stats = [
    { 
      label: 'Total', 
      value: bookings.length, 
      color: '#2c3e50',
      icon: '📊',
      bg: 'bg-light'
    },
    { 
      label: 'Pending', 
      value: bookings.filter(b => b.status === 'pending').length, 
      color: '#f39c12',
      icon: '⏳',
      bg: 'bg-warning bg-opacity-10'
    },
    { 
      label: 'Ready', 
      value: bookings.filter(b => b.status === 'ready').length, 
      color: '#3498db',
      icon: '✅',
      bg: 'bg-info bg-opacity-10'
    },
    { 
      label: 'In Transit', 
      value: bookings.filter(b => b.status === 'in-transit').length, 
      color: '#2980b9',
      icon: '🚗',
      bg: 'bg-primary bg-opacity-10'
    },
    { 
      label: 'Completed', 
      value: bookings.filter(b => b.status === 'completed').length, 
      color: '#27ae60',
      icon: '🎉',
      bg: 'bg-success bg-opacity-10'
    },
    { 
      label: 'With Deceased', 
      value: bookings.filter(b => b.deceased_id).length, 
      color: '#8e44ad',
      icon: '⚰️',
      bg: 'bg-secondary bg-opacity-10'
    }
  ];

  return (
    <Row className="mb-3 g-2">
      {stats.map((stat, index) => (
        <Col lg={2} md={4} sm={6} key={index}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className={`p-3 ${stat.bg}`}>
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ fontSize: '1.5rem' }}>
                  {stat.icon}
                </div>
                <div>
                  <h4 className="mb-0 fw-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </h4>
                  <small className="text-muted fw-semibold">
                    {stat.label}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// Filter Component
const BookingFilter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All', icon: '🌐', variant: 'outline-dark' },
    { key: 'pending', label: 'Pending', icon: '⏳', variant: 'outline-warning' },
    { key: 'ready', label: 'Ready', icon: '✅', variant: 'outline-info' },
    { key: 'in-transit', label: 'In Transit', icon: '🚗', variant: 'outline-primary' },
    { key: 'completed', label: 'Completed', icon: '🎉', variant: 'outline-success' },
  ];

  return (
    <div className="mb-3">
      <h6 className="mb-2 text-dark fw-semibold">
        Filter by Status:
      </h6>
      <div className="d-flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter.key}
            variant={currentFilter === filter.key ? filter.variant.replace('outline-', '') : filter.variant}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className="d-flex align-items-center gap-1 fw-semibold"
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

// Booking Details Modal
const BookingDetailsModal = ({ show, onHide, booking }) => {
  if (!booking) return null;

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold">
          📋 Booking Details - {utils.generateBookingId(booking.booking_id)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white fw-semibold">👤 Client Information</Card.Header>
              <Card.Body>
                <p className="mb-2"><strong>Name:</strong> {booking.client_name}</p>
                <p className="mb-2"><strong>Phone:</strong> {booking.client_phone}</p>
                <p className="mb-0"><strong>Email:</strong> {booking.client_email}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white fw-semibold">🚗 Service Details</Card.Header>
              <Card.Body>
                <p className="mb-2"><strong>Destination:</strong> {booking.destination}</p>
                <p className="mb-2"><strong>Hearse:</strong> {booking.number_plate}</p>
                <p className="mb-0"><strong>Departure:</strong> {formatDateTime(booking.estimated_departure_time)}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white fw-semibold">⚰️ Deceased Information</Card.Header>
              <Card.Body>
                {booking.deceased_name ? (
                  <>
                    <p className="mb-2"><strong>Name:</strong> {booking.deceased_name}</p>
                    <p className="mb-2"><strong>Gender:</strong> {booking.deceased_gender}</p>
                    <p className="mb-0"><strong>ID:</strong> {booking.deceased_id}</p>
                  </>
                ) : (
                  <p className="text-warning mb-0 fw-semibold">No deceased information</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white fw-semibold">👨‍💼 Driver Information</Card.Header>
              <Card.Body>
                {booking.driver_name ? (
                  <>
                    <p className="mb-2"><strong>Driver:</strong> {booking.driver_name}</p>
                    <p className="mb-2"><strong>Phone:</strong> {booking.driver_phone}</p>
                    <p className="mb-0"><strong>License:</strong> {booking.license_number}</p>
                  </>
                ) : (
                  <p className="text-warning mb-0 fw-semibold">No driver assigned</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          {booking.special_remarks && (
            <Col md={12}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-semibold">📝 Special Remarks</Card.Header>
                <Card.Body className="bg-light">
                  <p className="mb-0 fst-italic">{booking.special_remarks}</p>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

// Postpone Booking Modal
const PostponeBookingModal = ({ show, onHide, booking, onPostpone }) => {
  const [postponeData, setPostponeData] = useState({
    new_date: '',
    new_time: '',
    reason: '',
    updated_by: utils.getUpdatedBy(),
    branch_id: utils.getBranchId()
  });

  useEffect(() => {
    if (booking) {
      const currentDate = new Date(booking.estimated_departure_time);
      setPostponeData(prev => ({
        ...prev,
        new_date: currentDate.toISOString().split('T')[0],
        new_time: currentDate.toTimeString().slice(0, 5),
        updated_by: utils.getUpdatedBy(),
        branch_id: utils.getBranchId()
      }));
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postponePayload = {
        booking_id: utils.generateBookingId(booking.booking_id),
        new_date: postponeData.new_date,
        new_time: postponeData.new_time,
        reason: postponeData.reason,
        updated_by: postponeData.updated_by,
        branch_id: postponeData.branch_id
      };
      
      await onPostpone(booking.booking_id, postponePayload);
      onHide();
    } catch (error) {
      console.error('Error postponing booking:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold">📅 Postpone Booking</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">New Date *</Form.Label>
            <Form.Control
              type="date"
              value={postponeData.new_date}
              onChange={(e) => setPostponeData(prev => ({ ...prev, new_date: e.target.value }))}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">New Time</Form.Label>
            <Form.Control
              type="time"
              value={postponeData.new_time}
              onChange={(e) => setPostponeData(prev => ({ ...prev, new_time: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={postponeData.reason}
              onChange={(e) => setPostponeData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for postponement..."
            />
          </Form.Group>
          <div className="bg-light p-2 rounded small">
            <strong>Updated by:</strong> {postponeData.updated_by} | <strong>Branch:</strong> {postponeData.branch_id}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="warning" type="submit" className="fw-semibold">
            📅 Postpone Booking
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// Main Component
const BookingSystem = () => {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [bookingsData, driversData] = await Promise.all([
        bookingService.getBookings(),
        driverService.getDrivers()
      ]);
      setBookings(bookingsData);
      setDrivers(driversData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setError('');
      await bookingService.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(booking =>
        booking.booking_id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status.');
      console.error('Error updating status:', err);
    }
  };

  const handleDriverAssign = async (bookingId, driverId) => {
    try {
      setError('');
      const booking = bookings.find(b => b.booking_id === bookingId);
      if (!booking) throw new Error('Booking not found');
      
      await bookingService.assignDriver(bookingId, driverId, booking.hearse_id);
      
      const driver = drivers.find(d => d.driver_id === parseInt(driverId));
      if (!driver) throw new Error('Driver not found');
      
      setBookings(prev => prev.map(booking =>
        booking.booking_id === bookingId 
          ? { 
              ...booking, 
              driver_id: driver.driver_id,
              driver_name: driver.driver_name,
              driver_phone: driver.driver_phone,
              license_number: driver.license_number,
              status: 'ready'
            } 
          : booking
      ));
      setSuccess('Driver assigned successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to assign driver. Please try again.');
      console.error('Error assigning driver:', err);
    }
  };

  const handlePostponeBooking = async (bookingId, postponeData) => {
    try {
      setError('');
      await bookingService.postponeBooking(bookingId, postponeData);
      setSuccess('Booking postponed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadData();
    } catch (err) {
      setError('Failed to postpone booking. Please try again.');
      console.error('Error postponing booking:', err);
      throw err;
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleShowPostpone = (booking) => {
    setSelectedBooking(booking);
    setShowPostpone(true);
  };

  const getAvailableDrivers = () => {
    return drivers.filter(driver => 
      driver.availability_status === 'available' || 
      driver.status === 'available' ||
      driver.available === true
    );
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const availableDrivers = getAvailableDrivers();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" className="mb-3" />
          <h5 className="text-muted">Loading Bookings...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1 text-dark fw-bold">🚗 Hearse Booking Management</h3>
              <p className="text-muted mb-0">Manage all bookings and driver assignments</p>
            </div>
            <Button variant="primary" onClick={loadData} className="fw-semibold">
              🔄 Refresh Data
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          ⚠️ {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3">
          ✅ {success}
        </Alert>
      )}

      {/* Stats */}
      <BookingStats bookings={bookings} />
      
      {/* Filter */}
      <BookingFilter currentFilter={filter} onFilterChange={setFilter} />

      {/* Table */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0 text-dark fw-bold">
            📋 Bookings ({filteredBookings.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold border-0">Booking ID</th>
                  <th className="fw-semibold border-0">Client</th>
                  <th className="fw-semibold border-0">Destination</th>
                  <th className="fw-semibold border-0">Deceased</th>
                  <th className="fw-semibold border-0">Hearse</th>
                  <th className="fw-semibold border-0">Departure Time</th>
                  <th className="fw-semibold border-0">Status</th>
                  <th className="fw-semibold border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div className="py-3">
                        <div style={{ fontSize: '3rem' }}>📭</div>
                        <h5 className="mt-2">No bookings found</h5>
                        <p className="text-muted">Try changing your filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.booking_id} className="border-bottom">
                      <td>
                        <div>
                          <strong className="text-primary">
                            {utils.generateBookingId(booking.booking_id)}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {utils.formatDate(booking.created_at)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{booking.client_name}</strong>
                          <br />
                          <small className="text-muted">{booking.client_phone}</small>
                        </div>
                      </td>
                      <td>
                        <strong className="text-dark">{booking.destination}</strong>
                      </td>
                      <td>
                        {booking.deceased_name ? (
                          <div>
                            <strong>{booking.deceased_name}</strong>
                            <br />
                            <small className="text-muted">
                              {booking.deceased_gender} • {booking.deceased_id}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">No deceased</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong className="text-dark">{booking.number_plate}</strong>
                          {booking.model && (
                            <br />
                          )}
                          {booking.model && (
                            <small className="text-muted">{booking.model}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong className="text-dark">{utils.formatDate(booking.estimated_departure_time)}</strong>
                      </td>
                      <td>
                        <Badge 
                          className="fw-semibold"
                          bg={
                            booking.status === 'pending' ? 'warning' :
                            booking.status === 'ready' ? 'info' :
                            booking.status === 'in-transit' ? 'primary' :
                            booking.status === 'completed' ? 'success' : 'secondary'
                          }
                        >
                          {booking.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        {booking.driver_name && (
                          <div className="mt-1">
                            <small className="text-success fw-semibold">
                              👤 {booking.driver_name}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {/* Driver Assignment */}
                          {booking.status === 'pending' && !booking.driver_id && (
                            <Form.Select 
                              size="sm"
                              onChange={(e) => e.target.value && handleDriverAssign(booking.booking_id, e.target.value)}
                              style={{ width: '180px' }}
                              className="fw-semibold"
                            >
                              <option value="">👤 Select Driver</option>
                              {availableDrivers.length === 0 ? (
                                <option value="" disabled>🚫 No drivers available</option>
                              ) : (
                                availableDrivers.map(driver => (
                                  <option key={driver.driver_id} value={driver.driver_id}>
                                    {driver.driver_name} - {driver.license_number}
                                  </option>
                                ))
                              )}
                            </Form.Select>
                          )}

                          {/* Action Buttons */}
                          {booking.status === 'ready' && (
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleStatusUpdate(booking.booking_id, 'in-transit')}
                              className="fw-semibold"
                            >
                              🚀 Start Transit
                            </Button>
                          )}
                          
                          {booking.status === 'in-transit' && (
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleStatusUpdate(booking.booking_id, 'completed')}
                              className="fw-semibold"
                            >
                              ✅ Complete
                            </Button>
                          )}

                          {(booking.status === 'pending' || booking.status === 'ready') && (
                            <Button 
                              size="sm" 
                              variant="warning"
                              onClick={() => handleShowPostpone(booking)}
                              className="fw-semibold"
                            >
                              📅 Postpone
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="outline-info"
                            onClick={() => handleViewDetails(booking)}
                            className="fw-semibold"
                          >
                            👁️ Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
      <BookingDetailsModal 
        show={showDetails} 
        onHide={() => setShowDetails(false)} 
        booking={selectedBooking} 
      />

      <PostponeBookingModal
        show={showPostpone}
        onHide={() => setShowPostpone(false)}
        booking={selectedBooking}
        onPostpone={handlePostponeBooking}
      />
    </Container>
  );
};

export default BookingSystem;