import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  User, Calendar, Tag, Clipboard, Heart, Home,
  MapPin, CalendarClock, Footprints, Edit, Save, X, DollarSign, Clock, UserCheck,
  ArrowLeft, FlaskConical, PlusCircle, Trash2, Activity, Skull, Loader2,
  BookText, Phone, ListChecks, CheckSquare, XSquare, Briefcase, Box, Info,
  HeartPulse, ScanText, Microscope, Syringe, Landmark, Users, PiggyBank,
  SquareUser, Building2, CircleCheck, CircleX, Image, Eye, Pill, UserCog,
  CalendarDays, Key, Handshake, ScrollText, Palette, Ruler, Search, Coins,
  Truck, AlertTriangle, Archive, ShieldX, PersonStanding, CreditCard, Smartphone
} from 'lucide-react';
import Badge from 'react-bootstrap/Badge';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Styled Components ---
const StyledDeceasedSection = styled.div`
  background-color: #fff;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
  }
`;

const DataCard = styled.div`
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3b82f6;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DataField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  .icon {
    color: #4f46e5;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .label {
    font-weight: 600;
    color: #4a5568;
    min-width: 160px;
  }

  .value {
    color: #2d3748;
    word-break: break-word;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const SaveButton = styled(ActionButton)`
  background-color: #10b981;
  color: white;

  &:hover {
    background-color: #059669;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #6b7280;
  color: white;

  &:hover {
    background-color: #4b5563;
  }
`;

const ToastMessage = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$visible ? '0' : '100px'});
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease-out;
  opacity: ${props => props.$visible ? '1' : '0'};

  &.success {
    background-color: #10b981;
    color: white;
  }
  &.error {
    background-color: #ef4444;
    color: white;
  }
`;

const AgeBadge = styled(Badge)`
  font-size: 0.75rem;
  padding: 0.35rem 0.5rem;
  margin-left: 0.5rem;
  background-color: ${props => {
    switch(props.category) {
      case 'Infant': return '#ec4899';
      case 'Child': return '#f59e0b';
      case 'Teenager': return '#3b82f6';
      case 'Young Adult': return '#10b981';
      case 'Adult': return '#6366f1';
      case 'Middle-Aged': return '#8b5cf6';
      case 'Elderly': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

// --- Custom Hook for Toast ---
const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = useCallback((message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const Toast = () => (
    <ToastMessage
      $visible={toast.visible}
      className={toast.type}
    >
      {toast.message}
    </ToastMessage>
  );

  return { showToast, Toast };
};

// --- Main Component ---
const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

const DeceasedInfoSection = ({ onUpdate }) => {
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ageInfo, setAgeInfo] = useState({ years: 'N/A', category: 'Unknown' });
  const { showToast, Toast } = useToast();

  const calculateAgeInfo = useCallback((dob, dod) => {
    if (!dob || !dod) {
      setAgeInfo({ years: 'N/A', category: 'Unknown' });
      return;
    }

    const birthDate = new Date(dob);
    const deathDate = new Date(dod);

    if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
      setAgeInfo({ years: 'Invalid date', category: 'Unknown' });
      return;
    }
    if (deathDate < birthDate) {
      setAgeInfo({ years: 'Death before birth', category: 'Invalid' });
      return;
    }

    let years = deathDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = deathDate.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
      years--;
    }

    let category = 'Unknown';
    if (years < 1) category = 'Infant';
    else if (years < 13) category = 'Child';
    else if (years < 18) category = 'Teenager';
    else if (years < 25) category = 'Young Adult';
    else if (years < 40) category = 'Adult';
    else if (years < 60) category = 'Middle-Aged';
    else category = 'Elderly';

    setAgeInfo({ years, category });
  }, []);

  const fetchDeceasedData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      showToast('No deceased ID provided', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/deceased-id?id=${id}`);
      const deceasedData = response.data?.data;

      if (deceasedData) {
        // Clean and set the data
        const cleanedData = {
          ...deceasedData,
          full_name: deceasedData.full_name?.trim() || '',
          place_of_death: deceasedData.place_of_death?.trim() || '',
          cause_of_death: deceasedData.cause_of_death?.trim() || '',
          date_of_birth: deceasedData.date_of_birth ? new Date(deceasedData.date_of_birth).toISOString().split('T')[0] : '',
          date_of_death: deceasedData.date_of_death ? new Date(deceasedData.date_of_death).toISOString().split('T')[0] : '',
          date_admitted: deceasedData.date_admitted ? new Date(deceasedData.date_admitted).toISOString().split('T')[0] : '',
          dispatch_date: deceasedData.dispatch_date ? new Date(deceasedData.dispatch_date).toISOString().split('T')[0] : '',
        };
        setFormData(cleanedData);
        setOriginalData(cleanedData); // Store original data for "cancel" functionality
        calculateAgeInfo(cleanedData.date_of_birth, cleanedData.date_of_death);
      } else {
        setFormData(null);
        setOriginalData(null);
        showToast('No data found for this ID', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load deceased details', 'error');
      setFormData(null);
      setOriginalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast, calculateAgeInfo]);

  useEffect(() => {
    fetchDeceasedData();
  }, [fetchDeceasedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData || !id) {
      showToast('No data to save', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // API call to update data
      const response = await axios.put(`${API_BASE_URL}/update-deceased/${id}`, formData);

      if (response.data.success) {
        showToast('Details updated successfully', 'success');
        setIsEditMode(false);
        // Re-fetch data to ensure UI is in sync with the database
        await fetchDeceasedData();
        onUpdate?.(); // Callback for parent component
      } else {
        showToast(response.data.message || 'Failed to update details', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData); // Reset form data to the original fetched data
    setIsEditMode(false);
    showToast('Changes discarded', 'error');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : 'N/A';
  };

  if (isLoading) {
    return (
      <StyledDeceasedSection>
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </StyledDeceasedSection>
    );
  }

  if (!formData) {
    return (
      <StyledDeceasedSection>
        <div className="alert alert-warning mb-0">
          No deceased data available for ID: {id}
        </div>
      </StyledDeceasedSection>
    );
  }

  return (
    <>
      <StyledDeceasedSection>
        <SectionHeader>
          <h3>
            <User size={20} className="me-2" />
            Deceased Information
          </h3>
          {isEditMode ? (
            <div className="d-flex gap-2">
              <SaveButton onClick={handleSave} disabled={isLoading}>
                <Save size={16} className="me-1" />
                {isLoading ? 'Saving...' : 'Save'}
              </SaveButton>
              <CancelButton onClick={handleCancel} disabled={isLoading}>
                <X size={16} className="me-1" />
                Cancel
              </CancelButton>
            </div>
          ) : (
            <EditButton onClick={() => setIsEditMode(true)}>
              <Edit size={16} className="me-1" />
              Edit
            </EditButton>
          )}
        </SectionHeader>

        {!isEditMode ? (
          <DataCard>
            <DataGrid>
              {/* Basic Information */}
              <DataField>
                <Tag size={16} className="icon" />
                <span className="label">Deceased ID:</span>
                <span className="value">{formData.deceased_id || 'N/A'}</span>
              </DataField>

              <DataField>
                <User size={16} className="icon" />
                <span className="label">Full Name:</span>
                <span className="value">{formData.full_name || 'N/A'}</span>
              </DataField>

              <DataField>
                <User size={16} className="icon" />
                <span className="label">Gender:</span>
                <span className="value">{formData.gender || 'N/A'}</span>
              </DataField>

              <DataField>
                <Calendar size={16} className="icon" />
                <span className="label">Date of Birth:</span>
                <span className="value">{formatDate(formData.date_of_birth)}</span>
              </DataField>

              <DataField>
                <Calendar size={16} className="icon" />
                <span className="label">Date of Death:</span>
                <span className="value">{formatDate(formData.date_of_death)}</span>
              </DataField>

              <DataField>
                <Footprints size={16} className="icon" />
                <span className="label">Age at Death:</span>
                <span className="value">
                  {ageInfo.years} years
                  <AgeBadge pill category={ageInfo.category}>
                    {ageInfo.category}
                  </AgeBadge>
                </span>
              </DataField>

              {/* Death Details */}
              <DataField>
                <Heart size={16} className="icon" />
                <span className="label">Cause of Death:</span>
                <span className="value">{formData.cause_of_death || 'N/A'}</span>
              </DataField>

              <DataField>
                <Home size={16} className="icon" />
                <span className="label">Place of Death:</span>
                <span className="value">{formData.place_of_death || 'N/A'}</span>
              </DataField>

              <DataField>
                <Clipboard size={16} className="icon" />
                <span className="label">Admission Number:</span>
                <span className="value">{formData.admission_number || 'N/A'}</span>
              </DataField>

              <DataField>
                <Tag size={16} className="icon" />
                <span className="label">Mortuary ID:</span>
                <span className="value">{formData.mortuary_id || 'N/A'}</span>
              </DataField>

              <DataField>
                <CalendarClock size={16} className="icon" />
                <span className="label">Date Admitted:</span>
                <span className="value">{formatDate(formData.date_admitted)}</span>
              </DataField>

              {/* Location Information */}
              <DataField>
                <MapPin size={16} className="icon" />
                <span className="label">County:</span>
                <span className="value">{formData.county || 'N/A'}</span>
              </DataField>

              <DataField>
                <MapPin size={16} className="icon" />
                <span className="label">Location:</span>
                <span className="value">{formData.location || 'N/A'}</span>
              </DataField>

              {/* Registration Details */}
              <DataField>
                <UserCheck size={16} className="icon" />
                <span className="label">Registered By User ID:</span>
                <span className="value">{formData.registered_by_user_id || 'N/A'}</span>
              </DataField>

              <DataField>
                <UserCheck size={16} className="icon" />
                <span className="label">Registered By:</span>
                <span className="value">{formData.registered_by || 'N/A'}</span>
              </DataField>

              <DataField>
                <Tag size={16} className="icon" />
                <span className="label">Status:</span>
                <span className="value">{formData.status || 'N/A'}</span>
              </DataField>

              <DataField>
                <CalendarClock size={16} className="icon" />
                <span className="label">Date Registered:</span>
                <span className="value">{formatDateTime(formData.date_registered)}</span>
              </DataField>

              <DataField>
                <Clock size={16} className="icon" />
                <span className="label">Created At:</span>
                <span className="value">{formatDateTime(formData.created_at)}</span>
              </DataField>

              {/* Dispatch Information */}
              <DataField>
                <Calendar size={16} className="icon" />
                <span className="label">Dispatch Date:</span>
                <span className="value">{formatDate(formData.dispatch_date)}</span>
              </DataField>

              {/* Financial Information */}
              <DataField>
                <DollarSign size={16} className="icon" />
                <span className="label">Mortuary Charge:</span>
                <span className="value">{formatCurrency(formData.mortuary_charge)}</span>
              </DataField>

              <DataField>
                <DollarSign size={16} className="icon" />
                <span className="label">Total Mortuary Charge:</span>
                <span className="value">{formatCurrency(formData.total_mortuary_charge)}</span>
              </DataField>

              <DataField>
                <Clock size={16} className="icon" />
                <span className="label">Last Charge Update:</span>
                <span className="value">{formatDateTime(formData.last_charge_update)}</span>
              </DataField>

              {/* Additional Registration Info */}
              <DataField>
                <UserCheck size={16} className="icon" />
                <span className="label">Registered By Name:</span>
                <span className="value">{formData.registered_by_name || 'N/A'}</span>
              </DataField>

              <DataField>
                <UserCheck size={16} className="icon" />
                <span className="label">Registered By Work ID:</span>
                <span className="value">{formData.registered_by_work_id || 'N/A'}</span>
              </DataField>

              <DataField>
                <UserCheck size={16} className="icon" />
                <span className="label">Registered By Role:</span>
                <span className="value">{formData.registered_by_role || 'N/A'}</span>
              </DataField>
            </DataGrid>
          </DataCard>
        ) : (
          <div className="mt-4">
            <div className="row g-3">
              {/* Personal Information */}
              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <User size={16} /> Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <User size={16} /> Gender
                  </label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Calendar size={16} /> Date of Birth
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Calendar size={16} /> Date of Death
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_of_death"
                    value={formData.date_of_death || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Death Details */}
              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Heart size={16} /> Cause of Death
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="cause_of_death"
                    value={formData.cause_of_death || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Home size={16} /> Place of Death
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="place_of_death"
                    value={formData.place_of_death || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Clipboard size={16} /> Admission Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="admission_number"
                    value={formData.admission_number || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Mortuary Information */}
             

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <CalendarClock size={16} /> Date Admitted
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_admitted"
                    value={formData.date_admitted || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <Tag size={16} /> Status
                  </label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status || ''}
                    onChange={handleInputChange}
                  >
                    <option value="Received">Received</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <CalendarClock size={16} /> Dispatch Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="dispatch_date"
                    value={formData.dispatch_date || ''}
                    onChange={handleInputChange}
                    disabled={formData.status !== 'Dispatched'}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <MapPin size={16} /> County
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="county"
                    value={formData.county || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <MapPin size={16} /> Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="col-md-6 col-lg-4">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <DollarSign size={16} /> Mortuary Charge
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="mortuary_charge"
                    value={formData.mortuary_charge || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
             <div className="mb-3">
  <label className="form-label fw-semibold text-dark d-flex align-items-center gap-2">
    <DollarSign size={18} className="text-success" /> 
    Total Mortuary Charge
  </label>
  <input
    type="number"
    className="form-control shadow-sm border-0 rounded-3 px-3 py-2"
    style={{ backgroundColor: "#f9f9f9" }}
    name="total_mortuary_charge"
    value={formData.total_mortuary_charge || ""}
    onChange={handleInputChange}
    placeholder="Enter total charge"
  />
</div>

              </div>
            </div>
          </div>
        )}
      </StyledDeceasedSection>
      <Toast />
    </>
  );
};

export default DeceasedInfoSection;