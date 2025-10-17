import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  QrCode, FlaskConical, Printer, Scale, Droplet, CalendarCheck, RefreshCw, ArrowLeft,
  User, Info, AlertTriangle, CheckCircle, Users, Microscope, DollarSign, FileText, Box,
  CreditCard, Truck, CalendarDays, Coins, ListChecks, Activity, Footprints, Tag,
  MapPin, Home
} from 'lucide-react';
import styled from 'styled-components';

// --- Modern Color Palette ---
const Colors = {
  primaryDark: '#1E293B',
  accentRed: '#EF4444',
  accentBlue: '#3B82F6',
  lightGray: '#F8FAFC',
  mediumGray: '#E2E8F0',
  darkGray: '#334155',
  successGreen: '#10B981',
  dangerRed: '#DC2626',
  warningYellow: '#F59E0B',
  infoBlue: '#0EA5E9',
  textMuted: '#64748B',
  cardBg: '#FFFFFF',
  cardShadow: '0 4px 16px rgba(0,0,0,0.08)',
  borderColor: '#CBD5E1',
  activeTab: '#F0F4F8',
  infoBlueLight: '#93c5fd',
  purple: '#8b5cf6'
};

// --- Styled Components ---
const AppContainer = styled.div`
  min-height: 100vh;
  padding: 0rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${Colors.lightGray};
  line-height: 1.6;
`;

const ContentGrid = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 992px) {
    grid-template-columns: 65% 35%;
  }
`;
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  grid-column: 1 / -1; /* Full width on small screens */

  @media (min-width: 992px) {
    grid-column: 1 / 2; /* Takes first column on large screens */
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  grid-column: 1 / -1; /* Full width on small screens */

  @media (min-width: 992px) {
    grid-column: 2 / 3; /* Takes second column on large screens */
  }
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, ${Colors.primaryDark} 0%, #2c3e50 100%);
  color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  border: 1px solid #334155;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${Colors.accentBlue};
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: ${Colors.infoBlue};
    transform: translateX(-5px);
  }
`;

const Card = styled.div`
  background: ${Colors.cardBg};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: ${Colors.cardShadow};
  border: 1px solid ${Colors.borderColor};
  color: ${Colors.darkGray};
  width: 100%;
  box-sizing: border-box;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${Colors.mediumGray};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${Colors.primaryDark};
  
  svg {
    stroke-width: 2.5;
  }
`;

// Oval Icon Button - Made more compact
const OvalIconButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 75px;
  height: 55px;
  border-radius: 8px;
  border: none;
  background: ${props => props.bgColor || Colors.accentRed};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.4rem;
  margin: 0 0.3rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  svg {
    margin-bottom: 2px;
    width: 16px;
    height: 16px;
  }
  
  span {
    font-size: 0.65rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.1;
  }
  
  @media (max-width: 768px) {
    width: 65px;
    height: 50px;
    margin: 0 0.2rem;
  }
  
  @media (max-width: 480px) {
    width: 58px;
    height: 45px;
    margin: 0 0.15rem;
    
    span {
      font-size: 0.6rem;
    }
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

// Clickable Badge component - Made beautiful with full width distribution
const ClickableBadge = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: white;
  background-color: ${props => props.bgColor};
  box-shadow: 0 2px 8px ${props => props.bgColor}50;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  max-width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    filter: brightness(1.1);
  }

  svg {
    stroke-width: 2.5;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
    gap: 0.3rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.45rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

// Payment Button
const PaymentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${Colors.successGreen} 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3 ease;
  width: 100%;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

// Action Buttons Container - Made single line
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.3rem;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow-x: auto;
  padding: 0.5rem 0;
  width: 100%;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.2rem;
  }
`;

// Badges Container - Beautiful full width layout
const BadgesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 0;
  
  @media (max-width: 768px) {
    gap: 0.4rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.3rem;
  }
`;

// Badge Row - For organizing badges in rows
const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    gap: 0.4rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.3rem;
  }
`;

// Header Content Container - Aligned from start
const HeaderContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
`;

// Header Top Section - Single line layout
const HeaderTopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

// Name and Charges Container - Single line
const NameChargesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1rem;
    width: 100%;
    justify-content: space-between;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

// Import sub-components
import StatusTimeline from './statusTimeline';
import NotificationAlerts from './notificationAlerts';
import AgeClassification from './ageClaassification';
import MortuaryProgress from './mortuaryProgress';
import CoffinAssignment from './coffinAssignment';
import DeceasedInfoSection from './drceasedInfoSection';
import PostmortemInfoSection from './postmortemSection';
import NextOfKinSection from './nextOfKIn';
import VisitorsSection from './isitorsSection';
import DispatchSection from './dispatchSection';
import MortuaryCharges from './mortuaryCharge';
import EmbalmingInfoSection from './embalmingInfo';
import DocumentUpload from './DocumentUpload';
import DocumentSummary from './documentSumary';

// Import modals
import DeceasedInfoModal from './modals/deceasedinfomodal';
import NextOfKinModal from './modals/nextofKinModal';
import PostmortemModal from './modals/postmortemModal';
import EmbalmingModal from './modals/embalmingmodal';
import PaymentUpdateModal from './modals/paymentModal';
import FinancialDetailsModal from './modals/financialdetailsmodal';
import ColdRoomModal from './modals/coldRoom';
import DaysSpentModal from './modals/daySpend';
import InvoiceModal from './modals/invoicemodal';
import DispatchModal from './modals/dispatchModal';
import ChargeSettingsModal from './modals/chargesettingmodal';
import BurialTypeModal from './modals/burialTypeModal';
import BodyTagModal from './modals/bodytagmodal';
import ColdRoomAssignmentModal from './modals/coldroomassignmodal';

const DeceasedDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coffins, setCoffins] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal states
  const [showDeceasedInfoModal, setShowDeceasedInfoModal] = useState(false);
  const [showNextOfKinModal, setShowNextOfKinModal] = useState(false);
  const [showPostmortemModal, setShowPostmortemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmbalmingModal, setShowEmbalmingModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showColdRoomModal, setShowColdRoomModal] = useState(false);
  const [showDaysSpentModal, setShowDaysSpentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showChargeSettingsModal, setShowChargeSettingsModal] = useState(false);
  const [showBurialTypeModal, setShowBurialTypeModal] = useState(false);
  const [showBodyTagModal, setShowBodyTagModal] = useState(false);
  const [showColdRoomAssignmentModal, setShowColdRoomAssignmentModal] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  // Fetch deceased data
  const fetchDeceasedData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/deceased-id?id=${id}`);
      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
        setNotifications(response.data.notifications || []);
      } else {
        throw new Error('Invalid data structure received from API');
      }
      setIsLoading(false);
      toast.success(response.data.message || 'Data loaded successfully');
    } catch (error) {
      console.error('Error fetching deceased data:', error);
      toast.error('Failed to fetch deceased details');
      setIsLoading(false);
    }
  };

  // Fetch available coffins
  const fetchCoffins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all-coffins`);
      setCoffins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching coffins:', error);
      toast.error('Failed to fetch coffin data');
    }
  };

  useEffect(() => {
    fetchDeceasedData();
    fetchCoffins();
  }, [id]);

  const handleDocumentUploadSuccess = () => {
    toast.success('Document uploaded successfully');
  };

  // Calculate age information
  const calculateAge = (dob, dod) => {
    if (!dob || !dod) return { years: 'N/A', category: 'Unknown' };
    const birthDate = new Date(dob);
    const deathDate = new Date(dod);

    if (isNaN(birthDate.getTime())) return { years: 'Invalid Birth Date', category: 'Unknown' };
    if (isNaN(deathDate.getTime())) return { years: 'Invalid Death Date', category: 'Unknown' };
    if (deathDate < birthDate) return { years: 'Invalid Dates', category: 'Unknown' };

    let years = deathDate.getFullYear() - birthDate.getFullYear();
    const m = deathDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) {
      years--;
    }

    let category = 'Unknown';
    if (years < 13) category = 'Child';
    else if (years < 18) category = 'Teenager';
    else if (years < 25) category = 'Young Adult';
    else if (years < 40) category = 'Adult';
    else if (years < 60) category = 'Middle-Aged';
    else category = 'Elderly';

    return { years, category };
  };

  const ageInfo = calculateAge(
    deceasedData?.date_of_birth,
    deceasedData?.date_of_death
  );

  // Calculate days in mortuary
  const getDaysInMortuary = (admissionDate) => {
    if (!admissionDate) return 0;
    const admitted = new Date(admissionDate);
    const today = new Date();
    const diffTime = today - admitted;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysInMortuary = getDaysInMortuary(deceasedData?.date_admitted);

  if (isLoading) {
    return (
      <AppContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <RefreshCw size={48} color="#3B82F6" className="animate-spin" />
        <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading deceased details...</p>
      </AppContainer>
    );
  }

  if (!deceasedData) {
    return (
      <AppContainer>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#DC2626" style={{ marginBottom: '1rem' }} />
          <h3>Failed to load deceased details</h3>
          <p style={{ margin: '1rem 0', color: '#64748B' }}>
            We couldn't load the details for this deceased. Please try again later.
          </p>
          <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>
        </div>
      </AppContainer>
    );
  }

  // Calculate missing information
  const missingInfo = {
    autopsy: !deceasedData.postmortem,
    nextOfKin: !deceasedData.next_of_kin || deceasedData.next_of_kin.length === 0,
    dispatch: !deceasedData.dispatch,
    coffin: !deceasedData.coffin_status
  };

  // Badges data - organized for beautiful full-width display
  const primaryBadges = [
    { 
      text: `Status`, 
      color: daysInMortuary > 30 ? '#DC2626' : '#10B981', 
      icon: daysInMortuary > 30 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />, 
      onClick: () => setShowDeceasedInfoModal(true) 
    },
    { 
      text: `Next of Kin`, 
      color: '#0EA5E9', 
      icon: <Users size={14} />, 
      onClick: () => setShowNextOfKinModal(true) 
    },
    { 
      text: `Postmortem`, 
      color: '#EF4444', 
      icon: <Microscope size={14} />, 
      onClick: () => setShowPostmortemModal(true) 
    }
  ];

  const secondaryBadges = [
    { 
      text: 'Charges', 
      color: '#3B82F6', 
      icon: <DollarSign size={14} />, 
      onClick: () => setShowPaymentModal(true) 
    },
    { 
      text: 'Documents', 
      color: '#F59E0B', 
      icon: <FileText size={14} />, 
      onClick: () => navigate(`/documents/${id}`) 
    },
    { 
      text: 'Cold Room', 
      color: '#8b5cf6', 
      icon: <Home size={14} />, 
      onClick: () => setShowColdRoomModal(true) 
    },
    { 
      text: 'Body Tag', 
      color: '#10B981', 
      icon: <Tag size={14} />, 
      onClick: () => setShowBodyTagModal(true) 
    }
  ];

  return (
    <AppContainer>
      <ToastContainer position="top-right" autoClose={5000} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft /> Back to Dashboard
        </BackButton>

        <BackButton onClick={() => window.location.reload()}>
          <RefreshCw /> Refresh
        </BackButton>
      </div>

      <HeaderCard>
        <HeaderContentContainer>
          {/* First Row: Name and Charges in single line */}
          <HeaderTopSection>
            <NameChargesContainer>
              <h1 style={{
                fontSize: '1.8rem', 
                margin: 0, 
                display: 'flex', 
                gap: '0.75rem', 
                alignItems: 'center', 
                fontWeight: '800',
                whiteSpace: 'nowrap'
              }}>
                <User size={24} /> {deceasedData.full_name}
              </h1>

              <div style={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                whiteSpace: 'nowrap'
              }}>
                <h2 style={{margin: 0, fontWeight: 'bold', fontSize: '1.1rem'}}>
                  Total: {deceasedData.total_mortuary_charge || '0'} {deceasedData.currency || 'KES'}
                </h2>
                {deceasedData.currency === 'USD' && deceasedData.usd_charge_rate && (
                  <p style={{margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: '#F8FAFC'}}>
                    (Rate: 1 USD = {deceasedData.usd_charge_rate} KES)
                  </p>
                )}
              </div>
            </NameChargesContainer>
          </HeaderTopSection>

          {/* Second Row: Badges in beautiful full-width layout */}
          <BadgesContainer>
            {/* First row of badges */}
            <BadgeRow>
              {/* Burial Type Badge */}
              <ClickableBadge 
                key="burial-type" 
                bgColor="#F59E0B" 
                onClick={() => setShowBurialTypeModal(true)}
              >
                🪦 {deceasedData.burial_type || 'Burial'}
              </ClickableBadge>

              {/* Cold Room Assignment Badge */}
              {(deceasedData.cold_room_no || deceasedData.tray_no) && (
                <ClickableBadge 
                  key="cold-room-assignment" 
                  bgColor="#0EA5E9" 
                  onClick={() => setShowColdRoomAssignmentModal(true)}
                >
                  <MapPin size={14} /> Location
                </ClickableBadge>
              )}

              {primaryBadges.map((badge, index) => (
                <ClickableBadge key={index} bgColor={badge.color} onClick={badge.onClick}>
                  {badge.icon} {badge.text}
                </ClickableBadge>
              ))}
            </BadgeRow>

            {/* Second row of badges */}
            <BadgeRow>
              {secondaryBadges.map((badge, index) => (
                <ClickableBadge key={index} bgColor={badge.color} onClick={badge.onClick}>
                  {badge.icon} {badge.text}
                </ClickableBadge>
              ))}
            </BadgeRow>
          </BadgesContainer>

          {/* Third Row: Action Buttons in single line */}
          <ActionButtonsContainer>
            <OvalIconButton bgColor="#EF4444" onClick={() => navigate(`/qr-code/${id}`)}>
              <QrCode size={16} /> <span>QR Code</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#0EA5E9" onClick={() => setShowEmbalmingModal(true)}>
              <FlaskConical size={16} /> <span>Embalm</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#F59E0B" onClick={() => setShowFinancialModal(true)}>
              <DollarSign size={16} /> <span>Finance</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#93c5fd" onClick={() => setShowPaymentModal(true)}>
              <CreditCard size={16} /> <span>Pay</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#10B981" onClick={() => setShowInvoiceModal(true)}>
              <FileText size={16} /> <span>Invoice</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#8b5cf6" onClick={() => setShowDispatchModal(true)}>
              <Truck size={16} /> <span>Dispatch</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#F59E0B" onClick={() => setShowDaysSpentModal(true)}>
              <CalendarDays size={16} /> <span>Days</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#EF4444" onClick={() => setShowChargeSettingsModal(true)}>
              <Coins size={16} /> <span>Charges</span>
            </OvalIconButton>

            <OvalIconButton bgColor="#0EA5E9" onClick={() => navigate(`/sign-out/${id}`)}>
              <FileText size={16} /> <span>Sign Out</span>
            </OvalIconButton>

            {/* Cold Room Assignment Button */}
            <OvalIconButton bgColor="#0EA5E9" onClick={() => setShowColdRoomAssignmentModal(true)}>
              <MapPin size={16} /> <span>Assign</span>
            </OvalIconButton>
          </ActionButtonsContainer>
        </HeaderContentContainer>
      </HeaderCard>

      {/* Main Content Grid with proper width distribution */}
      <ContentGrid>
        <MainContent>
          {/* Deceased Information */}
          <Card>
            <CardTitle><Info /> Deceased Information</CardTitle>
            <DeceasedInfoSection 
              deceased={deceasedData} 
              ageInfo={ageInfo}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>

          {/* Notification Alerts */}
          <Card>
            <CardTitle><AlertTriangle /> Notification Alerts</CardTitle>
            <NotificationAlerts 
              deceasedId={deceasedData.id}
              missingInfo={missingInfo}
              notifications={notifications}
            />
          </Card>

          {/* Postmortem Section */}
          <Card>
            <CardTitle><Microscope /> Postmortem Information</CardTitle>
            <PostmortemInfoSection
              deceased={deceasedData}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>

          {/* Next of Kin Section */}
          <Card>
            <CardTitle><Users /> Next of Kin</CardTitle>
            <NextOfKinSection 
              deceasedId={deceasedData.id}
              nextOfKinData={deceasedData.next_of_kin}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>

          {/* Documents */}
          <Card>
            <CardTitle><FileText /> Documents</CardTitle>
            <DocumentUpload 
              deceasedId={deceasedData?.id || deceasedData?._id || deceasedData?.deceased_id}
              onUploadSuccess={handleDocumentUploadSuccess}
            />
            <DocumentSummary documents={deceasedData.documents} />
            <div style={{ marginTop: '1rem' }}>
              <PaymentButton onClick={() => navigate(`/documents/${id}`)}>
                <FileText size={16} /> View All Documents
              </PaymentButton>
            </div>
          </Card>
        </MainContent>

        <SidebarContent>
          {/* Mortuary Charges */}
          <Card>
            <CardTitle><DollarSign /> Mortuary Charges</CardTitle>
            <MortuaryCharges 
              deceasedId={deceasedData.id}
              deceasedCharges={deceasedData.charges || []}
              daysInMortuary={daysInMortuary}
              financialDetails={deceasedData.financial_details}
            />
            <PaymentButton onClick={() => setShowPaymentModal(true)}>
              <CreditCard size={16} /> Update Payment
            </PaymentButton>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardTitle><ListChecks /> Status Timeline</CardTitle>
            <StatusTimeline />
          </Card>
          
          {/* Mortuary Progress & Age Classification */}
          <Card>
            <CardTitle><Activity /> Mortuary Progress & Metrics</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <MortuaryProgress 
                daysInMortuary={daysInMortuary}
                dispatchDate={deceasedData.dispatch_date}
                isOverdue={daysInMortuary > 30}
              />
              <AgeClassification ageInfo={ageInfo} />
            </div>
          </Card>

          {/* Coffin Assignment */}
          <Card>
            <CardTitle><Box /> Coffin Assignment</CardTitle>
            <CoffinAssignment 
              deceased={deceasedData}
              coffins={coffins}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>

          {/* Embalming Info */}
          <Card>
            <CardTitle><FlaskConical /> Embalming Information</CardTitle>
            <EmbalmingInfoSection
              deceased={deceasedData}
              onEdit={() => setShowEmbalmingModal(true)}
            />
          </Card>
          
          {/* Visitors Section */}
          <Card>
            <CardTitle><Footprints /> Visitors</CardTitle>
            <VisitorsSection 
              deceasedId={deceasedData.id}
              visitors={deceasedData.visitors}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>

          {/* Dispatch Section */}
          <Card>
            <CardTitle><Truck /> Dispatch Information</CardTitle>
            <DispatchSection 
              deceasedId={deceasedData.id}
              dispatchData={deceasedData.dispatch}
              onUpdate={() => fetchDeceasedData()}
            />
          </Card>
        </SidebarContent>
      </ContentGrid>
      
      {/* Modals (remain the same) */}
      <DeceasedInfoModal 
        isOpen={showDeceasedInfoModal} 
        onClose={() => setShowDeceasedInfoModal(false)}
        deceased={deceasedData}
        ageInfo={ageInfo}
      />
      <NextOfKinModal 
        isOpen={showNextOfKinModal} 
        onClose={() => setShowNextOfKinModal(false)}
        nextOfKin={deceasedData.next_of_kin}
      />
      <PostmortemModal 
        isOpen={showPostmortemModal} 
        onClose={() => setShowPostmortemModal(false)}
        postmortem={deceasedData.postmortem}
      />
      <EmbalmingModal
        isOpen={showEmbalmingModal}
        onClose={() => setShowEmbalmingModal(false)}
        deceased={deceasedData}
        onUpdate={() => fetchDeceasedData()}
      />
      <PaymentUpdateModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        deceasedId={deceasedData.id}
        deceasedName={deceasedData.full_name}
      />
      <FinancialDetailsModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        deceasedData={deceasedData}
      />
      <ColdRoomModal
        isOpen={showColdRoomModal}
        onClose={() => setShowColdRoomModal(false)}
        deceasedData={deceasedData}
      />
      <DaysSpentModal
        isOpen={showDaysSpentModal}
        onClose={() => setShowDaysSpentModal(false)}
        deceasedData={deceasedData}
      />
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        deceasedData={deceasedData}
      />
      <DispatchModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        dispatchData={deceasedData.dispatch}
        deceasedName={deceasedData.full_name}
      />
      <ChargeSettingsModal
        isOpen={showChargeSettingsModal}
        onClose={() => setShowChargeSettingsModal(false)}
        deceasedData={deceasedData}
        onUpdate={() => fetchDeceasedData()}
      />
      <BurialTypeModal
        isOpen={showBurialTypeModal}
        onClose={() => setShowBurialTypeModal(false)}
        deceasedData={deceasedData}
        onUpdate={() => fetchDeceasedData()}
      />
      <BodyTagModal
        isOpen={showBodyTagModal}
        onClose={() => setShowBodyTagModal(false)}
        deceasedData={deceasedData}
        onUpdate={() => fetchDeceasedData()}
      />
      <ColdRoomAssignmentModal
        isOpen={showColdRoomAssignmentModal}
        onClose={() => setShowColdRoomAssignmentModal(false)}
        deceasedData={deceasedData}
        onUpdate={() => fetchDeceasedData()}
      />
    </AppContainer>
  );
};

export default DeceasedDetails;