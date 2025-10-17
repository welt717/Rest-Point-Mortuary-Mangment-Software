import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { 
  Archive, FlaskConical, Syringe, Box, Users, 
  DollarSign, Truck, ScrollText, CircleCheck, CircleX, ListChecks,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Modern Color Palette ---
const theme = {
  // Brand Colors
  primary: '#5D5FEF', // Vibrant violet
  primaryLight: '#8183f2',
  primaryDark: '#4B4DCC',
  success: '#10B981', // Emerald green
  successLight: '#34D399',
  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  danger: '#EF4444', // Red
  dangerLight: '#F87171',
  
  // Neutral Colors
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  subtleBg: '#F9FAFB',
  background: '#F8FAFC',
};

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(93, 95, 239, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(93, 95, 239, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(93, 95, 239, 0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: ${props => props.progress}%; }
`;

// --- Styled Components ---
const StyledCard = styled.div`
  background: ${theme.cardBg};
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 10px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid ${theme.border};
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
    background: linear-gradient(90deg, 
      ${theme.primary} 0%, 
      ${theme.success} 100%
    );
  }
`;

const SectionHeading = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${theme.textPrimary};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.75rem;
    left: 0;
    width: 3rem;
    height: 3px;
    background: ${theme.primary};
    border-radius: 2px;
  }
`;

const TimelineWrapper = styled.div`
  position: relative;
  padding: 2rem 0;
  margin: 0 -1rem;
`;

const TimelineProgress = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  height: 4px;
  background: linear-gradient(to right, 
    ${theme.success} 0%, 
    ${theme.border} ${({ progress }) => progress}%
  );
  width: ${({ progress }) => progress}%;
  transition: width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
  border-radius: 2px;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 0 1rem;
  min-width: 100px;
`;

const StepCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  
  ${props => props.completed && css`
    background: ${theme.success};
    color: white;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  `}

  ${props => props.active && css`
    background: ${theme.primary};
    color: white;
    box-shadow: 0 0 0 8px rgba(93, 95, 239, 0.2);
    animation: ${pulse} 2s infinite;
  `}
  
  ${props => !props.completed && !props.active && css`
    background: ${theme.subtleBg};
    border: 2px solid ${theme.border};
    color: ${theme.textMuted};
  `}
`;

const StepTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.completed ? theme.success : props.active ? theme.primary : theme.textMuted};
  margin-top: 0.5rem;
  white-space: nowrap;
  transition: color 0.3s ease;
`;

const StepDescription = styled.span`
  font-size: 0.8rem;
  color: ${theme.textMuted};
  margin-top: 0.25rem;
  font-weight: 500;
`;

const StepStatusIcon = styled.div`
  position: absolute;
  top: 45px;
  right: -5px;
  z-index: 3;
  background: ${theme.cardBg};
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${theme.border};
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: ${theme.textSecondary};
  font-weight: 500;
`;

const ProgressPercentage = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.primary};
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => props.variant === 'success' ? 
    `linear-gradient(135deg, ${theme.success} 0%, ${theme.successLight} 100%)` :
    `linear-gradient(135deg, ${theme.warning} 0%, ${theme.warningLight} 100%)`
  };
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StatusProgressLog = ({ deceased }) => {
  const steps = [
    { 
      id: 'received', 
      title: 'Received', 
      description: 'Body received',
      icon: <Archive size={24} />, 
      active: ['Received', 'Pending Autopsy', 'undergoing autopsy', 'Embalmed', 'Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'autopsy', 
      title: 'Autopsy', 
      description: 'Examination done',
      icon: <FlaskConical size={24} />, 
      active: ['Pending Autopsy', 'undergoing autopsy', 'Embalmed', 'Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'embalming', 
      title: 'Embalming', 
      description: 'Preservation',
      icon: <Syringe size={24} />, 
      active: ['Embalmed', 'Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'coffin', 
      title: 'Coffin', 
      description: 'Assigned',
      icon: <Box size={24} />, 
      active: deceased.coffin_assigned || ['Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'next_of_kin', 
      title: 'Next of Kin', 
      description: 'Verified',
      icon: <Users size={24} />, 
      active: deceased.next_of_kin_verified || ['Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'payment', 
      title: 'Payment', 
      description: 'Completed',
      icon: <DollarSign size={24} />, 
      active: deceased.payment_completed || ['Ready for Collection', 'Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'dispatch', 
      title: 'Dispatch', 
      description: 'Arranged',
      icon: <Truck size={24} />, 
      active: ['Dispatched', 'Archived'].includes(deceased.status) 
    },
    { 
      id: 'burial', 
      title: 'Burial', 
      description: 'Permit issued',
      icon: <ScrollText size={24} />, 
      active: deceased.burial_permit_issued || ['Archived'].includes(deceased.status) 
    }
  ];

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.active).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);
  const isComplete = progressPercentage === 100;

  return (
    <StyledCard>
      <SectionHeading>
        <ListChecks size={28} />
        Mortuary Process Timeline
      </SectionHeading>
      
      <TimelineWrapper>
        <TimelineProgress progress={progressPercentage} />
        <StepsContainer>
          {steps.map((step, index) => {
            const isCompleted = step.active;
            const isActive = isCompleted && (!steps[index + 1] || !steps[index + 1].active);
            
            return (
              <StepContainer key={step.id}>
                <StepCircle completed={isCompleted} active={isActive}>
                  {step.icon}
                </StepCircle>
                <StepTitle completed={isCompleted} active={isActive}>
                  {step.title}
                </StepTitle>
                <StepDescription>
                  {step.description}
                </StepDescription>
                <StepStatusIcon>
                  {isCompleted ? (
                    <CheckCircle size={20} color={theme.success} />
                  ) : (
                    <AlertCircle size={20} color={theme.textMuted} />
                  )}
                </StepStatusIcon>
              </StepContainer>
            );
          })}
        </StepsContainer>
      </TimelineWrapper>

      <ProgressInfo>
        <ProgressText>
          <Clock size={18} color={theme.textMuted} />
          Process Status: 
          <StatusBadge variant={isComplete ? 'success' : 'warning'}>
            {isComplete ? 'Complete' : 'In Progress'}
          </StatusBadge>
        </ProgressText>
        <ProgressPercentage>
          {progressPercentage}%
        </ProgressPercentage>
      </ProgressInfo>
    </StyledCard>
  );
};

export default StatusProgressLog;