import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Global styles
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

  body {
    background-color: #f5f5f5;
    font-family: 'Helvetica', sans-serif;
    padding: 20px;
  }

  /* Print Styles */
  @media print {
    body * {
      visibility: hidden;
    }

    .printable, .printable * {
      visibility: visible;
    }

    .printable {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .no-print {
      display: none !important;
    }
  }
`;

// Styled Components
const DeathNotificationContainer = styled.div`
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  padding: 30px;
  position: relative;
  font-family: 'Times New Roman', serif;
  color: #333;
  border: 3px solid #2c3e50;
  box-sizing: border-box;

  &::before {
    content: "OFFICIAL";
    position: absolute;
    top: 40%;
    left: 20%;
    font-size: 100px;
    color: rgba(0,0,0,0.05);
    transform: rotate(-30deg);
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 3px double #2c3e50;
  padding-bottom: 15px;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  margin: 10px 0 0;
  color: #7f8c8d;
  font-style: italic;
`;

const OfficialStamp = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;

  &::before {
    content: "";
    display: block;
    width: 80px;
    height: 80px;
    border: 2px solid #c0392b;
    border-radius: 50%;
    margin: 0 auto 5px;
    background: rgba(192, 57, 43, 0.1);
  }
`;

const NotificationNumber = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: bold;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
  background-color: ${props => 
    props.status === 'approved' ? '#d4edda' : 
    props.status === 'rejected' ? '#f8d7da' : 
    '#fff3cd'};
  color: ${props => 
    props.status === 'approved' ? '#155724' : 
    props.status === 'rejected' ? '#721c24' : 
    '#856404'};
  border: ${props => 
    props.status === 'approved' ? '1px solid #c3e6cb' : 
    props.status === 'rejected' ? '1px solid #f5c6cb' : 
    '1px solid #ffeeba'};
`;

const Section = styled.div`
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background: ${props => props.highlight ? '#f9f9f9' : 'white'};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 8px;
  margin-bottom: 15px;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FieldRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
`;

const FieldLabel = styled.div`
  flex: 1;
  font-weight: bold;
  color: #34495e;
  min-width: 150px;
`;

const FieldValue = styled.div`
  flex: 2;
  color: #2c3e50;
  word-break: break-word;
`;

const SignatureArea = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const SignatureBox = styled.div`
  width: 48%;
  border-top: 1px solid #333;
  padding-top: 15px;
  text-align: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SignatureLabel = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
`;

const SignatureSub = styled.div`
  font-size: 14px;
  margin-top: 8px;
  color: #7f8c8d;
`;

const FooterNote = styled.div`
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #ccc;
  text-align: center;
  font-size: 12px;
  font-style: italic;
  color: #7f8c8d;
`;

const MortuaryDetails = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #2c3e50;
  margin-top: 20px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #7f8c8d;
`;

const Error = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #e74c3c;
`;

// Main Component
const DeathNotification = () => {
  const [notificationData, setNotificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data simulating API
        setTimeout(() => {
          const mockData = {
            notification_number: "BN-20250913-4497",
            issued_at: "2025-09-13 17:33:46",
            status: "pending",
            deceased: {
              full_name: "Welt Tallis",
              gender: "Male",
              date_of_birth: "2001-03-11",
              date_of_death: "2025-07-19",
              cause_of_death: "Pneumonia",
              place_of_death: "Moi Teaching Hospital",
              county: "Uasin Gishu",
              location: "Eldoret",
              mortuary: {
                mortuary_id: "MORT003",
                name: "Eldoret Memorial Mortuary",
                address: "123 Main Street, Eldoret, Kenya",
                phone: "+254-123-456-789",
                hours: "24/7"
              }
            },
            next_of_kin: [
              { full_name: "Mary Njeri", relationship: "Mother", contact: "+254701234567", email: "mary.njeri@example.com" },
              { full_name: "John Tallis", relationship: "Father", contact: "+254712345678", email: "john.tallis@example.com" }
            ]
          };
          setNotificationData(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => window.print();

  if (loading) return <Loading>Loading death notification...</Loading>;
  if (error) return <Error>Error: {error}</Error>;
  if (!notificationData) return <Error>No notification data available</Error>;

  return (
    <>
      <GlobalStyle />

      {/* Print Button */}
      <div className="container no-print mb-3">
        <button className="btn btn-primary" onClick={handlePrint}>Print Notification</button>
      </div>

      {/* Printable Notification */}
      <div className="printable">
        <DeathNotificationContainer>
          <Header>
            <Title>OFFICIAL DEATH NOTIFICATION</Title>
            <Subtitle>Republic of Kenya - Ministry of Health</Subtitle>
          </Header>

          <OfficialStamp>Official Stamp</OfficialStamp>

          <NotificationNumber>
            Ref: {notificationData.notification_number}
            <StatusBadge status={notificationData.status}>{notificationData.status.toUpperCase()}</StatusBadge>
          </NotificationNumber>

          <Section>
            <SectionTitle>Deceased Information</SectionTitle>
            <FieldRow><FieldLabel>Full Name:</FieldLabel><FieldValue>{notificationData.deceased.full_name}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Gender:</FieldLabel><FieldValue>{notificationData.deceased.gender}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Date of Birth:</FieldLabel><FieldValue>{formatDate(notificationData.deceased.date_of_birth)}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Date of Death:</FieldLabel><FieldValue>{formatDate(notificationData.deceased.date_of_death)}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Cause of Death:</FieldLabel><FieldValue>{notificationData.deceased.cause_of_death}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Place of Death:</FieldLabel><FieldValue>{notificationData.deceased.place_of_death}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>County:</FieldLabel><FieldValue>{notificationData.deceased.county}</FieldValue></FieldRow>
            <FieldRow><FieldLabel>Location:</FieldLabel><FieldValue>{notificationData.deceased.location}</FieldValue></FieldRow>
          </Section>

          <Section>
            <SectionTitle>Next of Kin Information</SectionTitle>
            {notificationData.next_of_kin.map((kin, i) => (
              <div key={i}>
                <FieldRow><FieldLabel>Full Name:</FieldLabel><FieldValue>{kin.full_name}</FieldValue></FieldRow>
                <FieldRow><FieldLabel>Relationship:</FieldLabel><FieldValue>{kin.relationship}</FieldValue></FieldRow>
                <FieldRow><FieldLabel>Contact:</FieldLabel><FieldValue>{kin.contact}</FieldValue></FieldRow>
                <FieldRow><FieldLabel>Email:</FieldLabel><FieldValue>{kin.email}</FieldValue></FieldRow>
                {i < notificationData.next_of_kin.length - 1 && <hr style={{margin: '15px 0', borderTop: '1px dashed #ccc'}} />}
              </div>
            ))}
          </Section>

          <MortuaryDetails>
            <SectionTitle>Mortuary Authorization</SectionTitle>
            <p>This document has been verified and approved by the mortuary management for burial procedures.</p>
            <FieldRow><FieldLabel>Mortuary ID:</FieldLabel><FieldValue>{notificationData.deceased.mortuary.mortuary_id}</FieldValue></FieldRow>
          </MortuaryDetails>

          <SignatureArea>
            <SignatureBox>
              <SignatureLabel>Signature of Next of Kin</SignatureLabel>
              <SignatureSub>Name: _________________________</SignatureSub>
              <SignatureSub>Date: _________________________</SignatureSub>
              <SignatureSub>Relationship: __________________</SignatureSub>
            </SignatureBox>
            <SignatureBox>
              <SignatureLabel>Signature of Mortuary Administrator</SignatureLabel>
              <SignatureSub>Name: _________________________</SignatureSub>
              <SignatureSub>Date: _________________________</SignatureSub>
              <SignatureSub>Stamp: _________________________</SignatureSub>
            </SignatureBox>
          </SignatureArea>

          <FooterNote>
            <p>This is an official document. Any alterations without proper authorization may be punishable by law.</p>
            <p>Document generated electronically. Valid without physical signature.</p>
          </FooterNote>
        </DeathNotificationContainer>
      </div>
    </>
  );
};

export default DeathNotification;
