import React from 'react';
import styled from 'styled-components';

const AgeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  gap: 0.5rem;
  color: #1E293B;
  ${({ category }) => {
    switch (category) {
      case 'Child': return 'background-color: #A5F3FC;';
      case 'Teenager': return 'background-color: #A7F3D0;';
      case 'Young Adult': return 'background-color: #BFDBFE;';
      case 'Adult': return 'background-color: #C7D2FE;';
      case 'Middle-Aged': return 'background-color: #DDD6FE;';
      case 'Elderly': return 'background-color: #E5E7EB;';
      default: return 'background-color: #E2E8F0;';
    }
  }}
`;

const AgeGauge = styled.div`
  width: 100%;
  height: 8px;
  background: linear-gradient(to right,
    #A5F3FC 0%,
    #A5F3FC 13%,
    #A7F3D0 13%,
    #A7F3D0 18%,
    #BFDBFE 18%,
    #BFDBFE 25%,
    #C7D2FE 25%,
    #C7D2FE 40%,
    #DDD6FE 40%,
    #DDD6FE 60%,
    #E5E7EB 60%,
    #E5E7EB 100%);
  border-radius: 4px;
  margin-top: 0.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    width: 2px;
    height: 16px;
    background-color: #EF4444;
    left: ${props => {
      if (props.category === 'Child') return '6.5%';
      if (props.category === 'Teenager') return '15.5%';
      if (props.category === 'Young Adult') return '21.5%';
      if (props.category === 'Adult') return '32.5%';
      if (props.category === 'Middle-Aged') return '50%';
      return '80%';
    }};
  }
`;

const AgeClassification = ({ ageInfo }) => {
  // Add a defensive check to prevent destructuring an undefined value
  if (!ageInfo) {
    return null; // or return a fallback component/message
  }

  const { category, years } = ageInfo;

  return (
    <div>
      <AgeBadge category={category}>
        {years} yrs ({category})
      </AgeBadge>
      <AgeGauge category={category} />
    </div>
  );
};

export default AgeClassification;