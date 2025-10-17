import React from 'react';
import styled, { keyframes } from 'styled-components';

// --- Modern Color Palette ---
const COLORS = {
  bg: '#0f172a',           // Deep slate
  bgLight: 'rgba(30, 41, 59, 0.8)',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  primary: '#3b82f6',      // Bright blue
  primaryHover: '#60a5fa',
  success: '#10b981',      // Emerald
  accent: '#f59e0b',       // Amber
  hotline: '#ef4444',      // Red for urgency
  hotlineHover: '#f87171',
};

// --- Minimal Animations ---
const subtlePulse = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- Styled Components ---
const FooterContainer = styled.footer`
  background: ${COLORS.bg};
  color: ${COLORS.text};
  padding: 1rem 1.5rem;
  border-top: 1px solid ${COLORS.border};
  backdrop-filter: blur(10px);
  animation: ${slideUp} 0.5s ease-out;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
  font-size: 0.8rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: ${props => props.align === 'center' ? 'center' : 
                         props.align === 'right' ? 'flex-end' : 'flex-start'};

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.7rem;
  background: ${COLORS.bgLight};
  border-radius: 6px;
  border: 1px solid ${COLORS.border};
  font-size: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLORS.primary};
    transform: translateY(-1px);
  }
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.online ? COLORS.success : COLORS.accent};
  animation: ${subtlePulse} 2s ease-in-out infinite;
`;

const HotlineLink = styled.a`
  color: ${COLORS.text} !important;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  background: ${COLORS.bgLight};
  border-radius: 6px;
  border: 1px solid ${COLORS.border};
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    color: ${COLORS.hotline} !important;
    border-color: ${COLORS.hotline};
    background: rgba(239, 68, 68, 0.1);
    transform: translateY(-1px);
    text-decoration: none;
  }
`;

const BrandText = styled.span`
  color: ${COLORS.primary};
  font-weight: 600;
  font-size: 0.8rem;
`;

const MutedText = styled.span`
  color: ${COLORS.textMuted};
  font-size: 0.7rem;
`;

const CompactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.3rem 0.6rem;
  background: ${COLORS.bgLight};
  border-radius: 6px;
  border: 1px solid ${COLORS.border};
`;

const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.7rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.primary};
`;

// --- React Component ---
const FooterComponent = ({ userName = 'Admin' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      {/* Left Section - User & System Status */}
      <FooterSection align="left">
        <StatusBadge>
          <StatusDot online />
          <span>
            <BrandText>{userName}</BrandText>
            <MutedText> · Online</MutedText>
          </span>
        </StatusBadge>
        
        <SystemStatus>
          <StatusDot online />
          <span>System Active</span>
        </SystemStatus>
      </FooterSection>

      {/* Center Section - Contact */}
      <FooterSection align="center">
        <HotlineLink href="tel:+254740045355">
          <span>📞</span>
          +254 740 045 355
        </HotlineLink>
        <MutedText>24/7 Support · Feunaral  Home</MutedText>
      </FooterSection>

      {/* Right Section - Info */}
      <FooterSection align="right">
        <CompactInfo>
          <BrandText>Management System v1.0</BrandText>
          <MutedText>© {currentYear} Funeral Home</MutedText>
        </CompactInfo>
        <MutedText>Secure · Professional · Confidential</MutedText>
      </FooterSection>
    </FooterContainer>
  );
};

export default FooterComponent;