import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'; 
import styled, { keyframes } from 'styled-components';
import {
  Home,
  List,
  Users,
  UserCheck,
  Inbox,
  Menu,
  X,
  LogOut,
  Clock,
  BarChart2,
  Bell,
  MapPin,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  User,
  FileText,
  Grid,
  MoreHorizontal,
  ArrowUp
} from 'lucide-react';

// Import your components
import RegisterDeceased from './assets/components/user/registerDeceased';
import AllDeceasedPage from './assets/components/user/listDeceased';
import DeceasedDetailsPage from './assets/components/user/deceasedDetailPage';
import RegisterWorkUser from './assets/components/work/registerWorkUser';
import RegisterVisitor from './assets/components/visitor/visitor';
import RegisterCoffin from './assets/components/coffins/registerCoffin';
import Notifications from './assets/components/notifications/notifications';
import Analytics from './assets/components/analysis/analytics';
import NotificationAlerts from './assets/components/user/notificationAlerts';
import ReportGenerator from './assets/components/reportGenarte';
import DeathNotification from './assets/components/deathNotification/deathNotification';
import InstallPrompt from './assets/components/user/install';
import QRCodeViewer from './assets/components/user/qrcodeView';
import FuneralFeedbackForm from './assets/components/user/feedback';
import StaffPortal from './assets/components/user/staffPortal';
import { SocketProvider } from './context/socketContext';
import ActiveMonitoringAlert from './assets/components/user/activeMonitoring.jsx';
import FooterComponent from './assets/components/globalFooter.jsx';
import LoginPage from './assets/components/user/login.jsx';
import   DocumentsPage   from  './assets/components/user/modals/documentspage.jsx'
import   SignOutPage    from   './assets/components/user/modals/sigoutpage.jsx'

// --- Modern Color Palette ---
const Colors = {
  primary: '#2C3E50',
  primaryLight: '#34495E',
  secondary: '#00B894',
  accent: '#FFA500',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#E9ECEF',
  darkGray: '#495057',
  sidebarBg: '#FFFFFF',
  sidebarHover: 'rgba(0, 184, 148, 0.08)',
  sidebarActive: 'rgba(0, 184, 148, 0.15)',
  logoutRed: '#E74C3C',
  success: '#28A745',
  info: '#17A2B8',
  warning: '#FFC107',
  danger: '#DC3545',
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  glassEffect: 'rgba(255, 255, 255, 0.25)',
  tabletNavBg: 'rgba(255, 255, 255, 0.98)',
  backdropBlur: 'rgba(255, 255, 255, 0.9)'
};

// --- Animations ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -3px, 0);
  }
  70% {
    transform: translate3d(0, -1px, 0);
  }
  90% {
    transform: translate3d(0, -0.5px, 0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 3px ${Colors.secondary};
  }
  50% {
    box-shadow: 0 0 12px ${Colors.secondary};
  }
`;

// --- Styled Components for Responsive Layout ---
const AppLayout = styled.div`
  display: flex;
  flex-direction: ${props => props.isTablet ? 'column' : 'row'};
  min-height: 100vh;
  background: ${Colors.lightGray};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
`;

// Desktop Sidebar (Hidden on Tablet)
const DesktopSidebar = styled.div`
  width: ${props => props.isOpen ? '280px' : '80px'};
  min-width: ${props => props.isOpen ? '280px' : '80px'};
  height: 100vh;
  background: ${Colors.sidebarBg};
  color: ${Colors.textPrimary};
  padding: 1.5rem 0.75rem;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-right: 1px solid ${Colors.border};
  overflow-y: auto;
  display: ${props => props.isTablet ? 'none' : 'flex'};

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${Colors.lightGray};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${Colors.secondary};
    border-radius: 10px;
    &:hover {
      background: #00a882;
    }
  }
`;

// Compact Tablet Bottom Navigation
const TabletBottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${Colors.tabletNavBg};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid ${Colors.border};
  display: ${props => props.isTablet ? 'flex' : 'none'};
  align-items: center;
  justify-content: space-around;
  padding: 0 0.5rem;
  z-index: 1000;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
`;

const TabletNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 70px;
  padding: 0.4rem 0.2rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  min-height: 48px;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: ${props => props.active ? Colors.secondary : Colors.textSecondary};
    width: 100%;
    height: 100%;
    border-radius: 10px;
    padding: 0.3rem 0;
    transition: all 0.2s ease;

    &:hover {
      background: ${Colors.sidebarHover};
    }
  }

  &.active {
    a {
      color: ${Colors.secondary};
    }
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background: ${Colors.secondary};
      border-radius: 2px;
    }
  }

  svg {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
  }

  span {
    font-size: 0.65rem;
    font-weight: 600;
    text-align: center;
    line-height: 1;
    margin-top: 1px;
  }
`;

// More Menu for Tablet
const TabletMoreMenu = styled.div`
  position: fixed;
  bottom: 70px;
  right: 10px;
  background: ${Colors.backdropBlur};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${Colors.border};
  border-radius: 16px;
  padding: 0.8rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: ${slideUp} 0.2s ease-out;
  display: ${props => props.isOpen ? 'block' : 'none'};
  min-width: 160px;
`;

const TabletMoreMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  color: ${Colors.textPrimary};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s ease;
  margin-bottom: 0.3rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: ${Colors.sidebarHover};
    color: ${Colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isOpen ? 'space-between' : 'center'};
  padding: 0 0.25rem 1rem 0.25rem;
  margin-bottom: 1rem;
  border-bottom: ${props => props.isOpen ? `1px solid ${Colors.border}` : 'none'};
`;

const AppLogo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: ${Colors.primary};
  display: ${props => props.isOpen ? 'block' : 'none'};
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button`
  background: ${props => props.isOpen ? Colors.lightGray : 'none'};
  border: none;
  color: ${Colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${Colors.mediumGray};
    color: ${Colors.primary};
    transform: rotate(180deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OnlineStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  padding: ${props => props.isOpen ? '0.75rem 1rem' : '0.5rem'};
  margin-bottom: 1rem;
  background: linear-gradient(135deg, ${Colors.mediumGray} 0%, ${Colors.lightGray} 100%);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${Colors.success};
  transition: all 0.3s ease;
  border: 1px solid ${Colors.border};

  .dot {
    width: 10px;
    height: 10px;
    background: ${Colors.success};
    border-radius: 50%;
    margin-right: ${props => props.isOpen ? '0.75rem' : '0'};
    box-shadow: 0 0 10px ${Colors.success};
    animation: ${pulse} 2s infinite;
    flex-shrink: 0;
  }

  span {
    display: ${props => props.isOpen ? 'block' : 'none'};
    color: ${Colors.textPrimary};
    font-weight: 600;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  margin-bottom: 0.4rem;
  
  a {
    display: flex;
    align-items: center;
    gap: ${props => props.isOpen ? '1rem' : '0'};
    color: ${Colors.textSecondary};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};

    &:hover {
      background: ${Colors.sidebarHover};
      color: ${Colors.primary};
      transform: ${props => props.isOpen ? 'translateX(4px)' : 'none'};
      
      svg {
        color: ${Colors.secondary};
        transform: scale(1.05);
      }
    }

    &.active {
      background: ${Colors.sidebarActive};
      color: ${Colors.primary};
      font-weight: 700;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        height: 100%;
        border-radius: 0 4px 4px 0;
        background: linear-gradient(180deg, ${Colors.secondary} 0%, ${Colors.primary} 100%);
      }
      
      svg {
        color: ${Colors.secondary};
      }
    }

    svg {
      min-width: 20px;
      height: 20px;
      transition: all 0.3s ease;
      color: ${Colors.textSecondary};
      &.active-icon {
        color: ${Colors.secondary};
      }
    }

    span {
      display: ${props => props.isOpen ? 'block' : 'none'};
      opacity: ${props => props.isOpen ? '1' : '0'};
      transition: opacity 0.2s ease-in-out;
      white-space: nowrap;
    }
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid ${Colors.border};
`;

const RealTimeClock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${Colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 500;
  padding: ${props => props.isOpen ? '0.75rem 1rem' : '0.5rem'};
  margin-bottom: 1rem;
  background: linear-gradient(135deg, ${Colors.mediumGray} 0%, ${Colors.lightGray} 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  min-height: ${props => props.isOpen ? 'auto' : '40px'};
  border: 1px solid ${Colors.border};

  svg {
    min-width: 18px;
    color: ${Colors.info};
  }

  div {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    gap: 0.1rem;
  }

  .time {
    font-weight: 700;
    color: ${Colors.primary};
    font-size: 1rem;
  }

  .date {
    font-size: 0.75rem;
    color: ${Colors.textSecondary};
    font-weight: 500;
  }
`;

const LogoutWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.$isopen ? 'flex-start' : 'center'};
  min-height: ${props => props.$isopen ? 'auto' : '50px'};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: linear-gradient(135deg, ${Colors.logoutRed} 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);

  &:hover {
    background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    min-width: 20px;
  }

  span {
    display: ${({ $isopen }) => $isopen ? 'block' : 'none'};
    opacity: ${({ $isopen }) => $isopen ? '1' : '0'};
    transition: opacity 0.2s ease-in-out;
  }
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.isOpen ? '0.75rem' : '0.5rem'};
  background: linear-gradient(135deg, ${Colors.mediumGray} 0%, ${Colors.lightGray} 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  min-height: ${props => props.isOpen ? 'auto' : '50px'};
  border: 1px solid ${Colors.border};
  
  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .user-info {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    gap: 0.2rem;
    overflow: hidden;
  }

  .username {
    font-weight: 700;
    color: ${Colors.primary};
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role {
    font-size: 0.8rem;
    color: ${Colors.textSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: ${props => props.isTablet ? '60px' : '0'};
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: ${props => props.isTablet ? '1rem' : '2rem'};
`;

const RateInputContainer = styled.div`
  display: flex;
  padding: ${props => props.isOpen ? '0.75rem 1rem' : '0.5rem'};
  margin-bottom: 1rem;
  background: linear-gradient(135deg, ${Colors.mediumGray} 0%, ${Colors.lightGray} 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  min-height: ${props => props.isOpen ? 'auto' : '40px'};
  flex-direction: column;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  align-items: ${props => props.isOpen ? 'stretch' : 'center'};
  border: 1px solid ${Colors.border};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const RateInputLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: ${props => props.isOpen ? '0.5rem' : '0'};
  color: ${Colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 600;
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};

  svg {
    min-width: 18px;
    color: ${Colors.info};
  }

  span {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const RateInputField = styled.div`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;
`;

const RateInput = styled.input`
  width: 100%;
  padding: 0.6rem;
  border: 1px solid ${Colors.border};
  border-radius: 8px;
  font-size: 0.85rem;
  background: ${Colors.white};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${Colors.secondary};
    box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
    background: ${Colors.white};
  }

  &::placeholder {
    color: ${Colors.textSecondary};
    opacity: 0.7;
  }
`;

const UpdateButton = styled.button`
  background: linear-gradient(135deg, ${Colors.secondary} 0%, #00a882 100%);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 184, 148, 0.3);

  &:hover {
    background: linear-gradient(135deg, #00a882 0%, #009970 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 184, 148, 0.4);
  }

  &:disabled {
    background: ${Colors.textSecondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Enhanced Floating Controls
const FloatingControlsContainer = styled.div`
  position: fixed;
  bottom: ${props => props.isTablet ? '70px' : '30px'};
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

const FloatingToggleButton = styled.button`
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%);
  color: ${Colors.white};
  border: none;
  padding: 1rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(44, 62, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  animation: ${glow} 3s infinite;
  
  &:hover {
    background: linear-gradient(135deg, ${Colors.secondary} 0%, #00a882 100%);
    transform: scale(1.1) rotate(180deg);
    box-shadow: 0 8px 25px rgba(0, 184, 148, 0.4);
  }
`;

const FloatingMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: ${Colors.backdropBlur};
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.2s ease-out;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 160px;
`;

const FloatingMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  color: ${Colors.textPrimary};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${Colors.sidebarHover};
    color: ${Colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Go to Top Button
const GoToTopButton = styled.button`
  background: linear-gradient(135deg, ${Colors.accent} 0%, #ff8c00 100%);
  color: ${Colors.white};
  border: none;
  padding: 1rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255, 165, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  animation: ${glow} 3s infinite;
  
  &:hover {
    background: linear-gradient(135deg, #ff8c00 0%, #ff7f00 100%);
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(255, 165, 0, 0.4);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Table Navigation Component
const TableNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${Colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${Colors.border};
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.85rem;
  color: ${Colors.textSecondary};
  font-weight: 600;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${Colors.border};
  background: ${Colors.white};
  color: ${Colors.textPrimary};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    background: ${Colors.sidebarHover};
    border-color: ${Colors.secondary};
    color: ${Colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PageNumber = styled.span`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, ${Colors.lightGray} 0%, ${Colors.mediumGray} 100%);
  border-radius: 8px;
  font-weight: 700;
  color: ${Colors.primary};
  border: 1px solid ${Colors.border};
  font-size: 0.85rem;
`;

// Full Width Table Container
const FullWidthTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${Colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  border: 1px solid ${Colors.border};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid ${Colors.border};
  }
  
  th {
    background: linear-gradient(135deg, ${Colors.lightGray} 0%, ${Colors.mediumGray} 100%);
    font-weight: 700;
    color: ${Colors.primary};
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid ${Colors.secondary};
  }
  
  td {
    color: ${Colors.textPrimary};
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  tr:hover {
    background: ${Colors.sidebarHover};
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

// Enhanced Floating Controls Component
function FloatingControls({ isTablet }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  const canGoBack = location.key !== 'default';

  return (
    <FloatingControlsContainer isTablet={isTablet}>
      {showScrollTop && (
        <GoToTopButton onClick={scrollToTop} title="Go to Top">
          <ArrowUp size={20} />
        </GoToTopButton>
      )}
      
      {isOpen && (
        <FloatingMenu>
          <FloatingMenuItem onClick={() => navigate(-1)} disabled={!canGoBack}>
            <ArrowLeft size={16} /> Go Back
          </FloatingMenuItem>
          <FloatingMenuItem onClick={() => navigate(1)}>
            <ArrowRight size={16} /> Go Forward
          </FloatingMenuItem>
          <FloatingMenuItem onClick={scrollToTop}>
            <ArrowUp size={16} /> Go to Top
          </FloatingMenuItem>
          <FloatingMenuItem onClick={scrollToBottom}>
            <ArrowUp size={16} style={{ transform: 'rotate(180deg)' }} /> Go to Bottom
          </FloatingMenuItem>
          <FloatingMenuItem onClick={() => navigate('/register-deceased')}>
            <UserCheck size={16} /> Register
          </FloatingMenuItem>
          <FloatingMenuItem onClick={() => navigate('/all-deceased')}>
            <Search size={16} /> Search
          </FloatingMenuItem>
          <FloatingMenuItem onClick={() => navigate('/analytics')}>
            <BarChart2 size={16} /> Analytics
          </FloatingMenuItem>
        </FloatingMenu>
      )}
      <FloatingToggleButton onClick={handleToggle}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </FloatingToggleButton>
    </FloatingControlsContainer>
  );
}

// Tablet Bottom Navigation Component
function TabletBottomNavigation({ isTablet, currentPath }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/all-deceased', icon: List, label: 'Records' },
    { path: '/register-deceased', icon: UserCheck, label: 'Register' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/more', icon: MoreHorizontal, label: 'More' },
  ];

  const moreMenuItems = [
    { path: '/register-visitor', icon: Users, label: 'Visitors' },
    { path: '/register-coffin', icon: Inbox, label: 'Coffins' },
    { path: '/death-notify', icon: Bell, label: 'Notify' },
    { path: '/generate-report', icon: MapPin, label: 'Reports' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/register-user', icon: Settings, label: 'Staff' },
  ];

  const isActive = (path) => currentPath === path;

  return (
    <>
      <TabletBottomNav isTablet={isTablet}>
        {mainNavItems.map((item, index) => (
          <TabletNavItem 
            key={index}
            className={isActive(item.path) ? 'active' : ''}
            active={isActive(item.path)}
          >
            {item.path === '/more' ? (
              <a href="#more" onClick={(e) => { e.preventDefault(); setShowMoreMenu(!showMoreMenu); }}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ) : (
              <Link to={item.path} onClick={() => setShowMoreMenu(false)}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )}
          </TabletNavItem>
        ))}
      </TabletBottomNav>

      <TabletMoreMenu isOpen={showMoreMenu}>
        {moreMenuItems.map((item, index) => (
          <TabletMoreMenuItem 
            key={index}
            to={item.path}
            onClick={() => setShowMoreMenu(false)}
          >
            <item.icon size={16} />
            {item.label}
          </TabletMoreMenuItem>
        ))}
      </TabletMoreMenu>
    </>
  );
}

// Table Navigation Component
function TableNav({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <TableNavigation>
      <PaginationInfo>
        Showing {startItem} to {endItem} of {totalItems} entries
      </PaginationInfo>
      <PaginationControls>
        <PaginationButton 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} />
          Previous
        </PaginationButton>
        
        <PageNumber>
          Page {currentPage} of {totalPages}
        </PageNumber>
        
        <PaginationButton 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight size={14} />
        </PaginationButton>
      </PaginationControls>
    </TableNavigation>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mortuaryRate, setMortuaryRate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isTablet, setIsTablet] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Administrator");

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (token && user && loginTime) {
        // Check if login is still valid (optional: add expiration check)
        setIsAuthenticated(true);
        try {
          const userData = JSON.parse(user);
          setUserName(userData.name || "Admin");
          setUserRole(userData.role || "Administrator");
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        setIsAuthenticated(false);
        // Redirect to login if not on login page
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  // Check screen size for tablet detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Real-time clock effect
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      alert('Network error or server issue during logout. Please try again.');
    }
  };

  const handleUpdateRate = async () => {
    if (!mortuaryRate || isNaN(mortuaryRate) || parseFloat(mortuaryRate) <= 0) {
      setUpdateMessage('Please enter a valid rate');
      setTimeout(() => setUpdateMessage(''), 3000);
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setUpdateMessage('Rate updated successfully!');
      setMortuaryRate('');
    } catch (error) {
      setUpdateMessage('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper function to check if a path is active
  const isActive = (path) => location.pathname === path;

  // Safe function to get user initial
  const getUserInitial = () => {
    return userName && userName.charAt ? userName.charAt(0).toUpperCase() : 'A';
  };

  // If not authenticated and not on login page, show loading or redirect
  if (!isAuthenticated && location.pathname !== '/login') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: Colors.lightGray 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If on login page and not authenticated, show login page only
  if (location.pathname === '/login' && !isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppLayout isTablet={isTablet}>
      <SocketProvider>
        <InstallPrompt />
        <ActiveMonitoringAlert />
        
        {/* Desktop Sidebar */}
        <DesktopSidebar isOpen={isSidebarOpen} isTablet={isTablet}>
          <SidebarHeader isOpen={isSidebarOpen}>
            {isSidebarOpen ? (
              <AppLogo>Rest-Point</AppLogo>
            ) : (
              <Shield size={24} color={Colors.secondary} />
            )}
            <ToggleButton onClick={toggleSidebar} isOpen={isSidebarOpen}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </ToggleButton>
          </SidebarHeader>

          <OnlineStatus isOpen={isSidebarOpen}>
            <div className="dot"></div>
            <span>System Online</span>
          </OnlineStatus>

          <UserBadge isOpen={isSidebarOpen}>
            <div className="avatar">{getUserInitial()}</div>
            <div className="user-info">
              <div className="username">{userName}</div>
              <div className="role">{userRole}</div>
            </div>
          </UserBadge>

          {/* Mortuary Rate Input Field */}
          <RateInputContainer isOpen={isSidebarOpen}>
            <RateInputLabel isOpen={isSidebarOpen}>
              <DollarSign size={18} />
              <span>Mortuary Rate (Ksh)</span>
            </RateInputLabel>
            <RateInputField isOpen={isSidebarOpen}>
              <RateInput
                type="number"
                placeholder="Enter rate..."
                value={mortuaryRate}
                onChange={(e) => setMortuaryRate(e.target.value)}
                min="0"
                step="0.01"
              />
              <UpdateButton 
                onClick={handleUpdateRate} 
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Rate'}
              </UpdateButton>
            </RateInputField>
            {updateMessage && (
              <div style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                color: updateMessage.includes('success') ? Colors.success : Colors.danger,
                display: isSidebarOpen ? 'block' : 'none',
                fontWeight: '600'
              }}>
                {updateMessage}
              </div>
            )}
          </RateInputContainer>

          <NavList>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                <Home size={20} className={isActive('/') ? 'active-icon' : ''} />
                <span>Dashboard</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/all-deceased" className={isActive('/all-deceased') ? 'active' : ''}>
                <List size={20} className={isActive('/all-deceased') ? 'active-icon' : ''} />
                <span>All Records</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/register-deceased" className={isActive('/register-deceased') ? 'active' : ''}>
                <UserCheck size={20} className={isActive('/register-deceased') ? 'active-icon' : ''} />
                <span>Register Deceased</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/register-visitor" className={isActive('/register-visitor') ? 'active' : ''}>
                <Users size={20} className={isActive('/register-visitor') ? 'active-icon' : ''} />
                <span>Register Visitor</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/register-coffin" className={isActive('/register-coffin') ? 'active' : ''}>
                <Inbox size={20} className={isActive('/register-coffin') ? 'active-icon' : ''} />
                <span>Register Coffin</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/death-notify" className={isActive('/death-notify') ? 'active' : ''}>
                <Bell size={20} className={isActive('/death-notify') ? 'active-icon' : ''} />
                <span>Death Notify</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
                <BarChart2 size={20} className={isActive('/analytics') ? 'active-icon' : ''} />
                <span>Analytics</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/generate-report" className={isActive('/generate-report') ? 'active' : ''}>
                <MapPin size={20} className={isActive('/generate-report') ? 'active-icon' : ''} />
                <span>Reports</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>
                <Bell size={20} className={isActive('/notifications') ? 'active-icon' : ''} />
                <span>Alerts</span>
              </Link>
            </NavItem>
            <NavItem isOpen={isSidebarOpen}>
              <Link to="/register-user" className={isActive('/register-user') ? 'active' : ''}>
                <Settings size={20} className={isActive('/register-user') ? 'active-icon' : ''} />
                <span>Staff Management</span>
              </Link>
            </NavItem>
          </NavList>

          <SidebarFooter>
            <RealTimeClock isOpen={isSidebarOpen}>
              <Clock size={18} />
              {isSidebarOpen && (
                <div>
                  <div className="time">{formattedTime}</div>
                  <div className="date">{formattedDate}</div>
                </div>
              )}
            </RealTimeClock>

            <LogoutWrapper $isopen={isSidebarOpen}>
              <LogoutButton onClick={handleLogout} $isopen={isSidebarOpen}>
                <LogOut size={18} />
                <span>Logout</span>
              </LogoutButton>
            </LogoutWrapper>
          </SidebarFooter>
        </DesktopSidebar>

        {/* Tablet Bottom Navigation */}
        <TabletBottomNavigation isTablet={isTablet} currentPath={location.pathname} />

        <MainContent isTablet={isTablet}>
          <ContentWrapper isTablet={isTablet}>
            <Routes>
              <Route path="/" element={<AllDeceasedPage />} />
              <Route path="/all-deceased" element={<AllDeceasedPage />} />

                      <Route path="/documents/:deceasedId" element={<DocumentsPage  />} />
       

             <Route path="/sign-out/:deceasedId" element={<SignOutPage  />} />

       
              <Route path="/register-visitor" element={<RegisterVisitor />} />
              <Route path="/generate-report" element={<ReportGenerator />} />
              <Route path="/register-coffin" element={<RegisterCoffin />} />
              <Route path="/death-notify" element={<DeathNotification />} />
              <Route path="/feed-back" element={<FuneralFeedbackForm />} />
              <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="/qr-code/:id" element={<QRCodeViewer />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/register-deceased" element={<RegisterDeceased />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/deceased-details/:id" element={<DeceasedDetailsPage />} />
              <Route path="/deceased-details/:deceasedId" element={<NotificationAlerts />} />
              <Route path="/register-user" element={<RegisterWorkUser />} />
              <Route 
                path="/staff-portal" 
                element={
                  <SocketProvider>
                    <StaffPortal />
                  </SocketProvider>
                } 
              />
            </Routes>
          </ContentWrapper>
          
          <FooterComponent />
          <FloatingControls isTablet={isTablet} />
        </MainContent>
      </SocketProvider>
    </AppLayout>
  );
}

export { TableNav, FullWidthTableContainer, StyledTable };
export default App;