import React from 'react';
import styled from 'styled-components';
import { Clock, Calendar, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';

const Colors = {
  // New and improved color palette
  background: '#F0F4F8',
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderColor: '#E5E7EB',
  shadow: '0 8px 24px rgba(0,0,0,0.06)',
  
  // Vibrant, professional status colors
  accentBlue: '#2563EB',
  successGreen: '#059669',
  warningYellow: '#D97706',
  dangerRed: '#EF4444',

  // Progress bar colors
  progressStart: '#60A5FA',
  progressEnd: '#3B82F6',
};

const ProgressContainer = styled.div`
  background-color: ${Colors.cardBg};
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: ${Colors.shadow};
  border: 1px solid ${Colors.borderColor};
  color: ${Colors.textPrimary};
  font-family: 'Inter', sans-serif;
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${Colors.borderColor};
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: white; // Text is always white for better contrast
  background-color: ${props => props.bgColor};
  
  svg {
    stroke-width: 2.5;
    color: white;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProgressTitle = styled.h3`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: ${Colors.textPrimary};
  font-weight: 800;

  svg {
    color: ${Colors.accentBlue};
  }
`;

const ProgressBarWrapper = styled.div`
  background-color: ${Colors.borderColor};
  border-radius: 5px;
  height: 12px;
  margin: 1rem 0;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 5px;
  width: ${props => props.percentage}%;
  background: ${props => {
    if (props.percentage > 90) return `linear-gradient(to right, ${Colors.warningYellow}, ${Colors.dangerRed})`;
    if (props.percentage > 50) return `linear-gradient(to right, ${Colors.successGreen}, ${Colors.warningYellow})`;
    return `linear-gradient(to right, ${Colors.progressStart}, ${Colors.progressEnd})`;
  }};
  transition: width 0.5s ease, background 0.5s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${Colors.textSecondary};
  margin-top: 0.5rem;
  font-weight: 500;

  span strong {
    color: ${Colors.textPrimary};
    font-weight: 700;
  }
`;

const DispatchInfo = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${Colors.borderColor};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: ${Colors.textPrimary};
  font-weight: 600;

  svg {
    color: ${Colors.successGreen};
  }

  &.overdue svg {
    color: ${Colors.dangerRed};
  }
`;

const MortuaryProgress = ({ daysInMortuary, dispatchDate }) => {
  const maxDays = 30;
  const isOverdue = daysInMortuary > maxDays;
  const percentage = Math.min(100, (daysInMortuary / maxDays) * 100);

  return (
    <ProgressContainer>
      <BadgesContainer>
        <Badge bgColor={Colors.accentBlue}>
          <Clock size={16} /> Days: {daysInMortuary}
        </Badge>
        <Badge bgColor={isOverdue ? Colors.dangerRed : Colors.successGreen}>
          {isOverdue ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          Status: {isOverdue ? 'Overdue' : 'Active'}
        </Badge>
        {dispatchDate && (
          <Badge bgColor={Colors.accentBlue}>
            <Calendar size={16} /> Dispatch Set
          </Badge>
        )}
      </BadgesContainer>

      <ProgressHeader>
        <ProgressTitle><Hourglass /> Mortuary Stay</ProgressTitle>
      </ProgressHeader>

      <div>
        <ProgressBarWrapper>
          <ProgressFill percentage={percentage} />
        </ProgressBarWrapper>
        <ProgressStats>
          <span>Admission</span>
          <span>
            Day <strong>{daysInMortuary}</strong>
          </span>
          <span>Max Stay</span>
        </ProgressStats>
      </div>
      
      {dispatchDate && (
        <DispatchInfo className={isOverdue ? 'overdue' : ''}>
          {isOverdue ? <AlertTriangle size={20} /> : <Calendar size={20} />}
          <span>
            Scheduled dispatch date: <strong>{new Date(dispatchDate).toLocaleDateString()}</strong>
          </span>
        </DispatchInfo>
      )}
    </ProgressContainer>
  );
};

export default MortuaryProgress;
