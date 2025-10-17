import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  width: 100%;
`;

export const MainContent = styled.div`
  padding: 2rem;
`;

export const SidebarContent = styled.aside`
  background: #f1f5f9;
  padding: 1.5rem;
`;

export const HeaderCard = styled.div`
  background: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

export const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
`;

export const CardTitle = styled.h3`
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const BackButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
`;

export const OvalIconButton = styled.button`
  border-radius: 50%;
  background: #2563eb;
  color: white;
  padding: 0.75rem;
  border: none;
  cursor: pointer;
`;

export const ClickableBadge = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const Badge = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
`;

export const PaymentButton = styled.button`
  background: #16a34a;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #15803d;
  }
`;




