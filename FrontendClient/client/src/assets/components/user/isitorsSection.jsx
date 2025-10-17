import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  User, Calendar, Clock, Phone, BookText, PlusCircle, Trash2, X, Loader2 
} from 'lucide-react';

// API Base URL - use environment variable with fallback
const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

// A new, more vibrant and professional color palette
const Colors = {
  // Main brand colors
  primary: '#0F62FE',
  primaryHover: '#0040E0',
  secondary: '#6F6F6F',
  accent: '#FFC72C',
  
  // Neutral colors
  lightBackground: '#F4F7F9',
  cardBackground: '#FFFFFF',
  border: '#E0E0E0',
  
  // Semantic colors for status icons/messages
  success: '#198754',
  danger: '#dc3545',
  info: '#0dcaf0',
  
  // Text colors
  textPrimary: '#212529',
  textSecondary: '#6c757d',
};

// --- Styled Components for the Main Section ---
const StyledSectionContainer = styled.div`
  width: 100%;
  min-height: ${props => props.hasVisitors ? 'auto' : '80vh'};
  background-color: ${Colors.lightBackground};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

// --- Styled Components for the VisitorCard ---
const StyledVisitorCard = styled.div`
  background-color: ${Colors.cardBackground};
  border: 1px solid ${Colors.border};
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: ${Colors.primary};
  }
`;

// New container for visitors list when there are visitors
const VisitorsListContainer = styled.div`
  width: 100%;
  margin-top: 2rem;
  padding: 0;
`;

const VisitorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  padding: 0;
`;

const StyledUserIconContainer = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background-color: ${Colors.lightBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.primary};
`;

const StyledDeleteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${Colors.danger};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

// --- Styled Components for the Modal ---
const StyledModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  overflow-y: auto;
`;

const StyledModalContent = styled.div`
  background-color: ${Colors.cardBackground};
  border-radius: 1rem;
  padding: 2.5rem;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
  margin: 2rem 0;
`;

const StyledFormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 0.25rem rgba(15, 98, 254, 0.25);
  }
`;

const StyledFormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 0.25rem rgba(15, 98, 254, 0.25);
  }
`;

const StyledPrimaryButton = styled.button`
  background-color: ${Colors.primary};
  color: white;
  border-radius: 0.5rem;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  flex: 1;
  transition: all 0.2s;

  &:hover {
    background-color: ${Colors.primaryHover};
  }
  &:disabled {
    background-color: ${Colors.secondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StyledDangerButton = styled.button`
  background-color: ${Colors.danger};
  color: white;
  border-radius: 0.5rem;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  flex: 1;
  transition: all 0.2s;

  &:hover {
    background-color: #C32835;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${Colors.textSecondary};
  padding: 0.25rem;
  &:hover {
    color: ${Colors.textPrimary};
  }
`;

// VisitorCard component with new styling and icons
const VisitorCard = ({ visitor, onDelete }) => {
  return (
    <StyledVisitorCard>
      <div className="d-flex align-items-center gap-3 mb-4">
        <StyledUserIconContainer>
          <User size={28} strokeWidth={2.5} />
        </StyledUserIconContainer>
        <div className="flex-grow-1">
          <h4 className="h5 m-0 fw-bold text-dark">{visitor.full_name}</h4>
          <p className="small text-muted m-0">{visitor.relationship}</p>
        </div>
      </div>

      <div className="d-grid gap-3">
        <div className="d-flex align-items-center gap-2 text-dark small">
          <Phone size={18} className="text-primary" />
          <span>{visitor.contact}</span>
        </div>
        <div className="d-flex align-items-center gap-2 text-dark small">
          <BookText size={18} className="text-secondary" />
          <span>{visitor.purpose_of_visit}</span>
        </div>
        <div className="d-flex align-items-center gap-2 text-dark small">
          <Calendar size={18} className="text-success" />
          <span>{new Date(visitor.check_in_time).toLocaleDateString()}</span>
        </div>
        <div className="d-flex align-items-center gap-2 text-dark small">
          <Clock size={18} className="text-info" />
          <span>{new Date(visitor.check_in_time).toLocaleTimeString()}</span>
        </div>
      </div>
      
      <StyledDeleteButton onClick={() => onDelete(visitor.id)}>
        <Trash2 size={16} />
      </StyledDeleteButton>
    </StyledVisitorCard>
  );
};

// AddVisitorModal component
const AddVisitorModal = ({ show, onClose, onAddVisitor, isSubmitting }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    relationship: '',
    contact: '',
    purpose_of_visit: '',
  });

  // Effect to prevent body scrolling when the modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddVisitor(formData);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData({
        full_name: '',
        relationship: '',
        contact: '',
        purpose_of_visit: '',
      });
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h5 m-0 fw-bold d-flex align-items-center gap-2 text-dark">
            <User /> Add New Visitor
          </h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Full Name</label>
            <StyledFormInput
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              placeholder="Enter visitor's full name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Relationship</label>
            <StyledFormInput
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              required
              placeholder="e.g., Family member, Friend, Colleague"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Contact</label>
            <StyledFormInput
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              required
              placeholder="e.g., 0712345678"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark">Purpose of Visit</label>
            <StyledFormTextarea
              name="purpose_of_visit"
              value={formData.purpose_of_visit}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe the purpose of the visit..."
            />
          </div>

          <div className="d-flex gap-3 mt-4">
            <StyledDangerButton
              type="button"
              onClick={onClose}
            >
              Cancel
            </StyledDangerButton>
            <StyledPrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Adding...
                </>
              ) : (
                'Add Visitor'
              )}
            </StyledPrimaryButton>
          </div>
        </form>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// Debug component to see URL params
const DebugParams = () => {
  const params = useParams();
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        background: '#f8f9fa', 
        padding: '10px', 
        marginBottom: '15px', 
        borderRadius: '5px',
        border: '1px solid #dee2e6',
        fontSize: '0.875rem'
      }}>
        <strong>Debug - URL Parameters:</strong> {JSON.stringify(params)}
      </div>
    );
  }
  return null;
};

// Main VisitorsSection component
const VisitorsSection = ({ visitors = [], onAdd, onDelete, isLoading, error }) => {
  // Get deceasedId from URL parameters
  const { id, deceasedId } = useParams();
  
  // Use whichever parameter is available (id or deceasedId)
  const currentDeceasedId = deceasedId || id;
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const hasVisitors = visitors && visitors.length > 0;

  const handleAddVisitor = async (newVisitorData) => {
    // Validate that we have deceasedId from URL
    if (!currentDeceasedId) {
      setMessage({ 
        type: 'error', 
        text: 'Cannot add visitor: Missing deceased information. Please check the URL.' 
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/register-visitor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newVisitorData,
          deceased_id: currentDeceasedId, // ✅ Use the deceasedId from URL params
          check_in_time: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add visitor');
      }

      const result = await response.json();
      
      setMessage({ type: 'success', text: 'Visitor added successfully!' });
      setShowModal(false);
      
      // Call the parent component's refresh function
      if (onAdd) {
        onAdd();
      }
    } catch (error) {
      console.error('Error adding visitor:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add visitor. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete visitor');
      }

      // Call the parent component's refresh function
      if (onDelete) {
        onDelete();
      }
      setMessage({ type: 'success', text: 'Visitor removed successfully.' });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      setMessage({ type: 'error', text: 'Failed to delete visitor.' });
    }
  };

  // Show warning if no deceasedId is provided
  useEffect(() => {
    if (!currentDeceasedId) {
      setMessage({ 
        type: 'error', 
        text: 'Warning: Cannot add visitors without deceased information. Please check the URL.' 
      });
    } else {
      setMessage(null); // Clear error when deceasedId is available
    }
  }, [currentDeceasedId]);

  // Log the deceasedId for debugging
  useEffect(() => {
    console.log('Current deceasedId from URL:', currentDeceasedId);
  }, [currentDeceasedId]);

  return (
    <>
      {/* Main container with header and add button */}
      <StyledSectionContainer hasVisitors={hasVisitors}>
        {/* Debug info (only in development) */}
        <DebugParams />

        {/* Header and Add Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h4 fw-bold w-75 d-flex align-items-center gap-2 text-dark m-0">
            <User /> Visitors Log 
            {currentDeceasedId && (
              <span className="badge bg-primary ms-2">Deceased ID: {currentDeceasedId}</span>
            )}
            {hasVisitors && (
              <span className="badge bg-success ms-2">{visitors.length} Visitor(s)</span>
            )}
          </h3>
          <StyledPrimaryButton
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-2 fw-semibold"
            disabled={!currentDeceasedId} // ✅ Disable button if no deceasedId
          >
            <PlusCircle size={18} /> Add Visitor
          </StyledPrimaryButton>
        </div>

        {/* Message display */}
        {message && (
          <div 
            className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
            role="alert"
          >
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage(null)}
            ></button>
          </div>
        )}

        {/* Show warning if no deceasedId */}
        {!currentDeceasedId && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Note:</strong> Please navigate to a valid deceased person's page to manage visitors.
            <br />
            <small className="text-muted">The URL should include a deceased ID parameter.</small>
          </div>
        )}

        {/* Show empty state when no visitors */}
        {!hasVisitors && (
          <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
            <User size={48} className="text-secondary mb-3" />
            <p className="text-muted m-0">
              {currentDeceasedId ? 'No visitors have been recorded yet' : 'Navigate to a deceased person\'s page to view visitors'}
            </p>
            {currentDeceasedId && (
              <button 
                className="btn btn-primary mt-3"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle size={16} className="me-2" />
                Add First Visitor
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        <AddVisitorModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAddVisitor={handleAddVisitor}
          isSubmitting={isSubmitting}
        />
      </StyledSectionContainer>

      {/* Visitors list outside the container when there are visitors */}
      {hasVisitors && (
        <VisitorsListContainer>
          <VisitorsGrid>
            {visitors.map((visitor) => (
              <VisitorCard 
                key={visitor.id} 
                visitor={visitor} 
                onDelete={handleDeleteVisitor} 
              />
            ))}
          </VisitorsGrid>
        </VisitorsListContainer>
      )}
    </>
  );
};

export default VisitorsSection;