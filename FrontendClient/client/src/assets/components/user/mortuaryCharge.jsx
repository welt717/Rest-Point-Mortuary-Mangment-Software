import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, AlertCircle, CheckCircle, Loader2, Calendar, Clock, Clipboard, Truck, UserCheck, CreditCard, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled, { keyframes } from 'styled-components';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

// Modern color palette with gradients
const Colors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderColor: '#E5E7EB',
  accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  successGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  dangerGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  shadow: '0 6px 20px rgba(0,0,0,0.05), 0 3px 8px rgba(0,0,0,0.03)',
  shadowHover: '0 10px 30px rgba(0,0,0,0.08), 0 5px 12px rgba(0,0,0,0.05)',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---
const PageWrapper = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f8fafc;
  color: ${Colors.textPrimary};
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 1rem 0;
`;

const StyledCard = styled(Card)`
  border-radius: 0.75rem;
  box-shadow: ${Colors.shadow};
  border: none;
  margin-bottom: 1.25rem;
  transition: all 0.2s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: ${Colors.shadowHover};
    transform: translateY(-1px);
  }
`;

const InnerCard = styled.div`
  background: ${props => props.highlight ? '#f0f9ff' : '#f9fafb'};
  border: 1px solid ${props => props.highlight ? Colors.primary + '20' : Colors.borderColor};
  border-radius: 0.6rem;
  padding: 0.9rem;
  height: 100%;
  transition: all 0.2s ease;
  
  strong {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${Colors.textSecondary};
    display: block;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  
  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${Colors.textPrimary};
  }
  
  .icon {
    color: ${props => props.highlight ? Colors.primary : Colors.secondary};
    margin-right: 0.4rem;
  }
`;

const IconWrapper = styled.div`
  background: ${props => props.gradient ? props.gradient : '#f1f5f9'};
  padding: 0.5rem;
  border-radius: 0.75rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.08);
`;

const Title = styled.h5`
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${Colors.textPrimary};
`;

const PaymentAmount = styled.span`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger : Colors.success)};
  transition: all 0.2s ease;
  animation: ${pulse} 2s infinite;
`;

const PaymentStatus = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger : Colors.success)};
  padding: 0.35rem 0.75rem;
  border-radius: 1.5rem;
  border: 1.5px solid ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger + '20' : Colors.success + '20')};
`;

const ProgressBarContainer = styled.div`
  height: 10px;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
  margin: 1rem 0 0.4rem;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
`;

const StyledProgressBar = styled.div.attrs(props => ({
  style: {
    width: `${props.progress}%`,
    background: props.progress === 100 ? Colors.successGradient : Colors.accentGradient
  }
}))`
  height: 100%;
  border-radius: 0.75rem;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  padding: 0.9rem;
  border: 1px solid ${Colors.borderColor};
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  span {
    color: ${Colors.textPrimary};
    font-size: 0.85rem;
    font-weight: 500;
    flex: 1;
  }
`;

const StatBadge = styled(Badge)`
  background: ${props => {
    switch(props.variant) {
      case 'success': return Colors.successGradient;
      case 'warning': return Colors.warningGradient;
      case 'danger': return Colors.dangerGradient;
      default: return Colors.accentGradient;
    }
  }};
  color: white;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.75rem;
`;

const CardHeader = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-bottom: 1px solid ${Colors.borderColor};
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

// Main Component
function MortuaryCharges() {
  const { deceasedId } = useParams();
  const idToFetch = deceasedId || 'JOH-MFL0VJ6V-4V'; // Using the ID from your API response

  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]); // Added payments state

  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  const getDaysInMortuary = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/deceased-id?id=${idToFetch}`);
      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
        
        // In a real app, you would fetch payments separately
        // For now, we'll create mock payment data based on your API response
        const mockPayments = [
          { amount: 2000, date: '2025-09-16', method: 'MPESA', reference: 'MPE23456789' },
          { amount: 1500, date: '2025-09-17', method: 'Cash', reference: 'CASH001' }
        ];
        setPayments(mockPayments);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError("Failed to load data. Please check the API URL and server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idToFetch]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center p-4 rounded-3">
          <Loader2 className="animate-spin text-primary mb-3" size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <span className="fs-6 fw-medium text-secondary">Loading Financial Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center p-4 rounded-3 text-danger">
          <AlertCircle size={36} className="mb-3" />
          <span className="fs-6 fw-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (!deceasedData) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center rounded-3 text-secondary">
          <AlertCircle size={36} className="mb-3" />
          <span className="fs-6 fw-medium">No data found for this deceased ID.</span>
        </div>
      </div>
    );
  }

  // Extract data from the API response
  const daysInMortuary = getDaysInMortuary(deceasedData.date_admitted);
  
  // Parse numeric values from strings
  const totalMortuaryCharge = parseFloat(deceasedData.total_mortuary_charge) || 0;
  
  // Calculate payments
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  
  const balance = totalMortuaryCharge - totalPaid;
  const paymentPercentage = totalMortuaryCharge > 0 ? 
    Math.min(Math.round((totalPaid / totalMortuaryCharge) * 100), 100) : 0;

  // Calculate daily rate and projected charges
  const dailyRate = 1500; // Example daily rate
  const projectedCharges = daysInMortuary * dailyRate;

  // Generate notifications based on data
  const notifications = [
    { message: '💰 Outstanding balance of KSh ' + balance.toLocaleString() },
    { message: '✅ ' + payments.length + ' payment(s) received' },
    { message: '📅 ' + daysInMortuary + ' days in mortuary' }
  ];

  return (
    <PageWrapper>
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={12}>
            {/* Header Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <IconWrapper gradient={Colors.accentGradient}>
                      <UserCheck size={24} />
                    </IconWrapper>
                    <div>
                      <h1 className="h5 fw-bold text-dark mb-1">{deceasedData.full_name}</h1>
                      <span className="text-secondary small">Mortuary Financial Overview</span>
                    </div>
                  </div>
                  <StatBadge variant={balance > 0 ? "warning" : "success"}>
                    {balance > 0 ? 'Balance Due' : 'Account Settled'}
                  </StatBadge>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <InnerCard highlight>
                      <strong><Calendar size={16} className="icon" />Admission Date</strong>
                      <span>{deceasedData.date_admitted ? new Date(deceasedData.date_admitted).toLocaleDateString() : 'N/A'}</span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Clock size={16} className="icon" />Days in Mortuary</strong>
                      <span>{daysInMortuary} days</span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Truck size={16} className="icon" />Dispatch Status</strong>
                      <span>{deceasedData.dispatch_date ? new Date(deceasedData.dispatch_date).toLocaleDateString() : 'Pending'}</span>
                    </InnerCard>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>

            {/* Financial Summary Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.accentGradient}>
                    <DollarSign size={20} />
                  </IconWrapper>
                  <Title>Financial Summary</Title>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={6} className="text-center text-md-start">
                    <div className="mb-3">
                      <span className="text-secondary fw-semibold text-uppercase small d-block mb-1">Outstanding Balance</span>
                      <PaymentAmount isBalanceDue={balance > 0}>
                        KSh {Math.abs(balance).toLocaleString()}
                      </PaymentAmount>
                      <PaymentStatus isBalanceDue={balance > 0} className="d-block mt-2">
                        {balance > 0 ? 'Payment Required' : 'Fully Paid'}
                      </PaymentStatus>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary fw-medium small">
                        <CreditCard size={14} className="me-1" />
                        Total Charges
                      </span>
                      <span className="fw-semibold text-dark small">KSh {totalMortuaryCharge.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary fw-medium small">
                        <TrendingUp size={14} className="me-1" />
                        Amount Paid
                      </span>
                      <span className="fw-semibold text-success small">KSh {totalPaid.toLocaleString()}</span>
                    </div>
                    <ProgressBarContainer>
                      <StyledProgressBar progress={paymentPercentage} />
                    </ProgressBarContainer>
                    <div className="d-flex justify-content-between text-secondary fw-medium small mt-1">
                      <span>Payment Progress</span>
                      <span className="fw-bold" style={{ color: Colors.primary }}>{paymentPercentage}%</span>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>

            {/* Payment Details Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.infoBlue}>
                    <CreditCard size={20} />
                  </IconWrapper>
                  <Title>Payment Details</Title>
                </div>
              </CardHeader>
              <CardBody>
                {payments.length > 0 ? (
                  <div>
                    {payments.map((payment, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                        <div>
                          <span className="fw-medium">{payment.method}</span>
                          <br />
                          <small className="text-muted">{payment.reference}</small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold text-success">KSh {payment.amount.toLocaleString()}</span>
                          <br />
                          <small className="text-muted">{payment.date}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">No payments recorded yet</p>
                )}
              </CardBody>
            </StyledCard>

            {/* Additional Financial Metrics */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.warningGradient}>
                    <Info size={20} />
                  </IconWrapper>
                  <Title>Additional Metrics</Title>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <InnerCard>
                      <strong><Clock size={16} className="icon" />Daily Rate</strong>
                      <span>KSh {dailyRate.toLocaleString()}</span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={6}>
                    <InnerCard>
                      <strong><DollarSign size={16} className="icon" />Projected Charges</strong>
                      <span>KSh {projectedCharges.toLocaleString()}</span>
                    </InnerCard>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>

            {/* Notifications Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.successGradient}>
                    <Clipboard size={20} />
                  </IconWrapper>
                  <Title>Notifications & Alerts</Title>
                </div>
              </CardHeader>
              <CardBody>
                <div>
                  {notifications.map((notification, index) => {
                    const icon = notification.message.includes('✅') ? <CheckCircle className="text-success" size={18} />
                      : notification.message.includes('💰') ? <DollarSign className="text-warning" size={18} />
                      : <AlertTriangle className="text-info" size={18} />;

                    return (
                      <NotificationItem key={index}>
                        {icon}
                        <span>{notification.message}</span>
                      </NotificationItem>
                    );
                  })}
                </div>
              </CardBody>
            </StyledCard>
          </Col>
        </Row>
      </Container>
    </PageWrapper>
  );
}

export default MortuaryCharges;