import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, FileText, User, Calendar, Download, CheckCircle, X, Save } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import SignaturePad from 'react-signature-pad-wrapper';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SubmitButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #059669;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

// Signature Section Styles
const SignatureSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
`;

const SignatureContainer = styled.div`
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
  height: 150px;
  width: 100%;
  cursor: crosshair;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const SignaturePlaceholder = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  font-style: italic;
  pointer-events: none;
`;

const SignatureActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ClearSignatureButton = styled.button`
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #dc2626;
    color: white;
  }
`;

const SaveSignatureButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #3b82f6;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const SignaturePreview = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background: #f9fafb;
  text-align: center;
  
  img {
    max-width: 200px;
    max-height: 80px;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SignOutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sigPad = useRef(null);
  
  const [formData, setFormData] = useState({
    releaseTo: '',
    relationship: '',
    idNumber: '',
    phoneNumber: '',
    releaseDate: new Date().toISOString().split('T')[0],
    releaseTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    remarks: '',
    documentsReceived: false,
    balanceCleared: false,
    bodyCondition: 'good',
    collectorId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [savedSignature, setSavedSignature] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Signature handlers
  const clearSignature = useCallback(() => {
    if (sigPad.current) {
      sigPad.current.clear();
      setSignatureEmpty(true);
      setSavedSignature(null);
    }
  }, []);

  const handleSignatureBegin = useCallback(() => {
    setSignatureEmpty(false);
  }, []);

  const handleSignatureEnd = useCallback(() => {
    if (sigPad.current) {
      setSignatureEmpty(sigPad.current.isEmpty());
    }
  }, []);

  const saveSignature = useCallback(() => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.toDataURL('image/png');
      setSavedSignature(signatureData);
      toast.success('Signature saved successfully');
    } else {
      toast.error('Please provide a signature first');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!savedSignature) {
      toast.error('Please provide and save your signature');
      return;
    }

    if (!formData.documentsReceived || !formData.balanceCleared) {
      toast.error('Please confirm all documents are received and balances are cleared');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        deceasedId: id,
        ...formData,
        digitalSignature: savedSignature,
        signedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Sign-out payload:', payload);
      
      toast.success('Deceased signed out successfully');
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out deceased');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReleaseForm = () => {
    if (!savedSignature) {
      toast.error('Please provide a signature first');
      return;
    }
    
    toast.success('Release form generated successfully');
    // Implement PDF generation with signature
    console.log('Generating PDF with signature:', savedSignature);
  };

  const bodyConditionOptions = [
    { value: 'good', label: 'Good Condition' },
    { value: 'fair', label: 'Fair Condition' },
    { value: 'poor', label: 'Poor Condition' },
    { value: 'fragile', label: 'Fragile' },
    { value: 'embalmed', label: 'Embalmed' },
    { value: 'unembalmed', label: 'Unembalmed' }
  ];

  return (
    <PageContainer>
      <ToastContainer />
      <Header>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
            <FileText size={32} style={{ marginRight: '1rem' }} />
            Sign Out Deceased
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
            Complete the release process for deceased ID: {id}
          </p>
        </div>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back to Details
        </BackButton>
      </Header>

      <form onSubmit={handleSubmit}>
        <ContentCard>
          <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Release Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label>
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Released To
              </Label>
              <Input
                type="text"
                name="releaseTo"
                value={formData.releaseTo}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Relationship</Label>
              <Input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                placeholder="Relationship to deceased"
                required
              />
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label>ID Number</Label>
              <Input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Enter ID number"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label>Collector's ID</Label>
              <Input
                type="text"
                name="collectorId"
                value={formData.collectorId}
                onChange={handleInputChange}
                placeholder="Collector's ID number"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Body Condition</Label>
              <select
                name="bodyCondition"
                value={formData.bodyCondition}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                required
              >
                {bodyConditionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label>
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                Release Date
              </Label>
              <Input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Release Time</Label>
              <Input
                type="time"
                name="releaseTime"
                value={formData.releaseTime}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Remarks</Label>
            <TextArea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Any additional remarks about the release, body condition, or special instructions..."
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="documentsReceived"
                checked={formData.documentsReceived}
                onChange={handleInputChange}
              />
              All documents received and verified
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="balanceCleared"
                checked={formData.balanceCleared}
                onChange={handleInputChange}
              />
              All balances cleared
            </label>
          </div>

          {/* Digital Signature Section */}
          <SignatureSection>
            <SectionTitle>
              <FileText size={20} />
              Digital Signature
            </SectionTitle>
            
            <Label>Authorized Signature (Sign below)</Label>
            <SignatureContainer>
              <SignaturePad
                ref={sigPad}
                options={{
                  minWidth: 1,
                  maxWidth: 2,
                  penColor: 'black',
                  onBegin: handleSignatureBegin,
                  onEnd: handleSignatureEnd
                }}
                redrawOnResize={true}
                style={{ width: '100%', height: '100%' }}
              />
              {signatureEmpty && (
                <SignaturePlaceholder>
                  Sign here to authorize body collection...
                </SignaturePlaceholder>
              )}
            </SignatureContainer>

            <SignatureActions>
              <ClearSignatureButton onClick={clearSignature}>
                <X size={16} />
                Clear Signature
              </ClearSignatureButton>
              <SaveSignatureButton onClick={saveSignature} disabled={signatureEmpty}>
                <Save size={16} />
                Save Signature
              </SaveSignatureButton>
            </SignatureActions>

            {savedSignature && (
              <SignaturePreview>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#059669' }}>
                  ✓ Signature Saved Successfully
                </p>
                <img src={savedSignature} alt="Saved signature" />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Your signature will be included in the release documentation
                </p>
              </SignaturePreview>
            )}
          </SignatureSection>
        </ContentCard>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={generateReleaseForm}
            style={{
              background: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={20} />
            Generate Release Form
          </button>

          <SubmitButton
            type="submit"
            disabled={isSubmitting || !formData.documentsReceived || !formData.balanceCleared || !savedSignature}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Processing...
              </>
            ) : (
              <>
                Complete Sign Out
                <CheckCircle size={20} />
              </>
            )}
          </SubmitButton>
        </div>
      </form>
    </PageContainer>
  );
};

export default SignOutPage;