import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  FlaskConical, 
  TrendingUp, 
  Users, 
  Truck,
  Calendar,
  Plus,
  X,
  DollarSign,
  AlertTriangle,
  Settings,
  Sparkles
} from 'lucide-react';

// Modern color palette
const colors = {
  primary: '#5D5FEF',
  primaryLight: '#8183f2',
  primaryGradient: 'linear-gradient(135deg, #5D5FEF 0%, #8183f2 100%)',
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(93, 95, 239, 0.5); }
  50% { box-shadow: 0 0 20px rgba(93, 95, 239, 0.8); }
  100% { box-shadow: 0 0 5px rgba(93, 95, 239, 0.5); }
`;

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  background: ${colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1), 0 15px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.gray200};
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${colors.primaryGradient};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.gray900};
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  background: ${colors.primaryGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  svg {
    color: ${colors.primary};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${colors.gray50};
  padding: 20px;
  border-radius: 20px;
  border: 1px solid ${colors.gray200};
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray600};
  min-width: 120px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 12px;
  background: ${colors.gray200};
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${colors.primaryGradient};
  border-radius: 6px;
  transition: width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: ${props => props.progress}%;
  box-shadow: 0 0 10px rgba(93, 95, 239, 0.3);
`;

const ProgressPercentage = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.primary};
  min-width: 50px;
  text-align: right;
`;

const Timeline = styled.div`
  display: grid;
  gap: 24px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 28px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, ${colors.primary} 0%, ${colors.gray200} 100%);
    z-index: 1;
  }
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 2;
  padding: 8px;
  border-radius: 16px;
  transition: all 0.3s ease;

  ${props => props.status === 'active' && css`
    background: rgba(93, 95, 239, 0.05);
    border: 1px solid rgba(93, 95, 239, 0.1);
    transform: translateX(8px);
  `}

  ${props => props.status === 'completed' && css`
    opacity: 0.9;
  `}
`;

const TimelineIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;

  ${props => props.status === 'completed' && css`
    background: ${colors.success};
    color: ${colors.white};
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  `}

  ${props => props.status === 'active' && css`
    background: ${colors.primary};
    color: ${colors.white};
    box-shadow: 0 0 0 8px rgba(93, 95, 239, 0.2);
    animation: ${pulse} 2s infinite, ${glow} 3s infinite;
  `}

  ${props => props.status === 'pending' && css`
    background: ${colors.gray100};
    color: ${colors.gray400};
    border: 2px solid ${colors.gray300};
  `}

  ${props => props.hasWarning && css`
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${colors.error};
      border: 2px solid ${colors.white};
      animation: ${pulse} 1.5s infinite;
    }
  `}
`;

const TimelineContent = styled.div`
  flex: 1;
  padding: 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
`;

const TimelineTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    switch(props.status) {
      case 'completed': return colors.success;
      case 'active': return colors.primary;
      default: return colors.gray600;
    }
  }};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineDescription = styled.p`
  font-size: 14px;
  color: ${colors.gray500};
  margin: 0;
  line-height: 1.5;
`;

const TimelineTime = styled.span`
  font-size: 12px;
  color: ${colors.gray400};
  display: block;
  margin-top: 8px;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;

  ${props => props.status === 'completed' && css`
    background: rgba(16, 185, 129, 0.1);
    color: ${colors.success};
  `}

  ${props => props.status === 'active' && css`
    background: rgba(93, 95, 239, 0.1);
    color: ${colors.primary};
  `}

  ${props => props.status === 'pending' && css`
    background: rgba(156, 163, 175, 0.1);
    color: ${colors.gray500};
  `}
`;

const AddServiceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.primaryGradient};
  color: ${colors.white};
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(93, 95, 239, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(93, 95, 239, 0.4);
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: ${colors.white};
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.4s ease;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${colors.gray200};
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray900};
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.gray500};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.gray100};
    color: ${colors.gray700};
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ServiceCard = styled.div`
  background: ${props => props.selected ? colors.primaryLight : colors.gray50};
  color: ${props => props.selected ? colors.white : colors.gray700};
  border: 2px solid ${props => props.selected ? colors.primary : colors.gray200};
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: ${colors.primary};
  }
`;

const ServiceTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ServicePrice = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.selected ? colors.white : colors.success};
`;

const ServiceDescription = styled.p`
  font-size: 13px;
  color: ${props => props.selected ? 'rgba(255, 255, 255, 0.8)' : colors.gray500};
  margin: 8px 0 0 0;
  line-height: 1.4;
`;

const CustomServiceInput = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: ${colors.gray50};
  border-radius: 16px;
  border: 2px dashed ${colors.gray300};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.gray200};
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.gray200};
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 12px;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${colors.primaryGradient};
  color: ${colors.white};
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(93, 95, 239, 0.4);
  }

  &:disabled {
    background: ${colors.gray300};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatusTimeline = ({ status, embalmed, autopsyDone, nextOfKin }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customService, setCustomService] = useState({
    name: '',
    description: '',
    price: ''
  });

  const steps = [
    {
      id: 'received',
      title: 'Body Received',
      description: 'Deceased has been received and registered in the system',
      icon: <User size={24} />,
      status: 'completed',
      time: '2 hours ago',
      hasWarning: false
    },
    {
      id: 'autopsy',
      title: 'Autopsy',
      description: 'Post-mortem examination and documentation',
      icon: <FlaskConical size={24} />,
      status: autopsyDone || ['Embalmed', 'Ready for Collection', 'Dispatched', 'Archived'].includes(status) ? 
        'completed' : status === 'Pending Autopsy' || status === 'undergoing autopsy' ? 'active' : 'pending',
      time: autopsyDone ? 'Completed' : 'In progress',
      hasWarning: !autopsyDone && !['Embalmed', 'Ready for Collection', 'Dispatched', 'Archived'].includes(status)
    },
    {
      id: 'embalming',
      title: 'Embalming Process',
      description: 'Preservation and preparation of the deceased',
      icon: <TrendingUp size={24} />,
      status: embalmed || ['Ready for Collection', 'Dispatched', 'Archived'].includes(status) ? 
        'completed' : status === 'Embalmed' ? 'active' : 'pending',
      time: embalmed ? 'Completed' : 'Pending',
      hasWarning: !embalmed && !['Ready for Collection', 'Dispatched', 'Archived'].includes(status)
    },
    {
      id: 'nextofkin',
      title: 'Next of Kin',
      description: 'Family notification and documentation',
      icon: <Users size={24} />,
      status: nextOfKin ? 'completed' : 'pending',
      time: nextOfKin ? 'Verified' : 'Awaiting verification',
      hasWarning: !nextOfKin
    },
    {
      id: 'dispatch',
      title: 'Dispatch Ready',
      description: 'Preparation for release and transportation',
      icon: <Truck size={24} />,
      status: ['Dispatched', 'Archived'].includes(status) ? 
        'completed' : status === 'Ready for Collection' ? 'active' : 'pending',
      time: ['Dispatched', 'Archived'].includes(status) ? 'Completed' : 'Preparing',
      hasWarning: !['Dispatched', 'Archived', 'Ready for Collection'].includes(status)
    }
  ];

  const extraServices = [
    {
      id: 'body_preparation',
      name: 'Body Preparation',
      description: 'Thorough cleaning, dressing, and cosmetic preparation',
      price: 15000,
      selected: false
    },
    {
      id: 'special_embalming',
      name: 'Special Embalming',
      description: 'Advanced preservation techniques for extended viewing',
      price: 25000,
      selected: false
    },
    {
      id: 'viewing_room',
      name: 'Private Viewing Room',
      description: 'Dedicated space for family viewing and farewell',
      price: 10000,
      selected: false
    },
    {
      id: 'transportation',
      name: 'Special Transportation',
      description: 'Premium hearse and procession services',
      price: 20000,
      selected: false
    },
    {
      id: 'documentation',
      name: 'Extra Documentation',
      description: 'Additional certificates and paperwork processing',
      price: 5000,
      selected: false
    }
  ];

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'active': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmitServices = () => {
    // Send data to backend
    const servicesData = {
      selectedServices,
      customService: customService.name ? customService : null,
      timestamp: new Date().toISOString()
    };

    console.log('Submitting services:', servicesData);
    // API call would go here
    setShowModal(false);
  };

  return (
    <>
      <Container>
        <Header>
          <Title>
            <Calendar size={28} />
            Mortuary Process Timeline
          </Title>
        </Header>

        <ProgressContainer>
          <ProgressText>Process Completion</ProgressText>
          <ProgressBar>
            <ProgressFill progress={progressPercentage} />
          </ProgressBar>
          <ProgressPercentage>{progressPercentage}%</ProgressPercentage>
        </ProgressContainer>

        <Timeline>
          {steps.map((step) => (
            <TimelineItem key={step.id} status={step.status}>
              <TimelineIcon status={step.status} hasWarning={step.hasWarning}>
                {step.icon}
                {step.hasWarning && <AlertTriangle size={12} style={{ position: 'absolute', top: 4, right: 4, color: 'white' }} />}
              </TimelineIcon>
              
              <TimelineContent status={step.status}>
                <TimelineTitle status={step.status}>
                  {step.title}
                  <StatusBadge status={step.status}>
                    {step.status.toUpperCase()}
                  </StatusBadge>
                </TimelineTitle>
                
                <TimelineDescription>
                  {step.description}
                </TimelineDescription>
                
                <TimelineTime>
                  {step.time}
                </TimelineTime>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        <AddServiceButton onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Extra Services
        </AddServiceButton>
      </Container>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Sparkles size={24} />
                Additional Services
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ServiceGrid>
              {extraServices.map(service => (
                <ServiceCard 
                  key={service.id} 
                  selected={selectedServices.includes(service.id)}
                  onClick={() => toggleService(service.id)}
                >
                  <ServiceTitle>
                    <Settings size={16} />
                    {service.name}
                  </ServiceTitle>
                  <ServicePrice selected={selectedServices.includes(service.id)}>
                    <DollarSign size={14} />
                    {service.price.toLocaleString()}
                  </ServicePrice>
                  <ServiceDescription selected={selectedServices.includes(service.id)}>
                    {service.description}
                  </ServiceDescription>
                </ServiceCard>
              ))}
            </ServiceGrid>

            <CustomServiceInput>
              <h4 style={{ margin: '0 0 16px 0', color: colors.gray700 }}>
                Custom Service Request
              </h4>
              <Input
                placeholder="Service Name"
                value={customService.name}
                onChange={(e) => setCustomService({...customService, name: e.target.value})}
              />
              <TextArea
                placeholder="Service Description"
                value={customService.description}
                onChange={(e) => setCustomService({...customService, description: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Price (KSh)"
                value={customService.price}
                onChange={(e) => setCustomService({...customService, price: e.target.value})}
              />
            </CustomServiceInput>

            <SubmitButton onClick={handleSubmitServices}>
              Confirm Services
            </SubmitButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default StatusTimeline;