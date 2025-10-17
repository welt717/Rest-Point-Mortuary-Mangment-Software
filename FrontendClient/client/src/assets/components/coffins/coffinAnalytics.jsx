import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import styled from 'styled-components';
import { FiDollarSign, FiShoppingCart, FiUsers, FiBox } from 'react-icons/fi';

// Modern color palette
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  info: '#3b82f6',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0'
};

const DashboardContainer = styled(Container)`
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const DashboardCard = styled(Card)`
  border: none;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
`;

const MetricCard = styled(DashboardCard)`
  .metric-icon {
    background: ${props => props.color}1a;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CustomTooltip = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid ${colors.border};
  backdrop-filter: blur(4px);
`;

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/shopingsite/sales');
        setData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const { 
    totalSales,
    totalOrders,
    activeUsers,
    monthlyRevenue,
    productDistribution,
    averageOrderValue
  } = data;

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <CustomTooltip>
          <h4 className="text-sm font-semibold mb-2">{label}</h4>
          {payload.map((entry, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              <div 
                className="color-indicator" 
                style={{ background: entry.color, width: '12px', height: '12px', borderRadius: '4px' }}
              />
              <span className="text-sm">{entry.name}:</span>
              <span className="text-sm font-semibold">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <DashboardContainer fluid>
      <h1 className="mb-4 text-gray-900 fw-bold">Business Analytics</h1>
      
      {/* Metrics Row */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <MetricCard color={colors.primary}>
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="metric-icon">
                <FiDollarSign size={24} color={colors.primary} />
              </div>
              <div>
                <div className="text-muted mb-1">Total Sales</div>
                <h3 className="mb-0">KSH {totalSales.toLocaleString()}</h3>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>

        <Col md={3}>
          <MetricCard color={colors.success}>
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="metric-icon">
                <FiShoppingCart size={24} color={colors.success} />
              </div>
              <div>
                <div className="text-muted mb-1">Total Orders</div>
                <h3 className="mb-0">{totalOrders.toLocaleString()}</h3>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>

        <Col md={3}>
          <MetricCard color={colors.secondary}>
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="metric-icon">
                <FiUsers size={24} color={colors.secondary} />
              </div>
              <div>
                <div className="text-muted mb-1">Active Users</div>
                <h3 className="mb-0">{activeUsers.toLocaleString()}</h3>
              </div>
            </Card.Body>
          </MetricCard>
        </Col>

        <Col md={3}>
          <MetricCard color={colors.info}>
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="metric-icon">
                <FiBox size={24} color={colors.info} />
              </div>
              <div>
                <div className="text-muted mb-1">Avg. Order Value</div>
                <h3 className="mb-0">KSH {averageOrderValue.toFixed(2)}</h3>
              </div>
            </Card.Body> 
          </MetricCard>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4">
        <Col md={8}>
          <DashboardCard>
            <Card.Body>
              <ChartHeader>
                <div>
                  <h3 className="text-gray-900 fw-semibold mb-1">Revenue Overview</h3>
                  <p className="text-muted mb-0">Monthly revenue performance</p>
                </div>
              </ChartHeader>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={colors.border} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: colors.textSecondary }}
                      tickLine={{ stroke: colors.border }}
                    />
                    <YAxis 
                      tickFormatter={value => `${value.toLocaleString()}`}
                      tick={{ fill: colors.textSecondary }}
                      tickLine={{ stroke: colors.border }}
                    />
                    <Tooltip content={renderTooltip} />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue"
                      fill="url(#colorRevenue)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </DashboardCard>
        </Col>

        <Col md={4}>
          <DashboardCard>
            <Card.Body>
              <ChartHeader>
                <div>
                  <h3 className="text-gray-900 fw-semibold mb-1">Product Distribution</h3>
                  <p className="text-muted mb-0">Sales by product category</p>
                </div>
              </ChartHeader>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {productDistribution.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={[
                            colors.primary,
                            colors.success,
                            colors.secondary,
                            colors.info
                          ][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(value) => (
                        <span className="text-sm text-muted">{value}</span>
                      )}
                    />
                    <Tooltip content={renderTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </DashboardCard>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;