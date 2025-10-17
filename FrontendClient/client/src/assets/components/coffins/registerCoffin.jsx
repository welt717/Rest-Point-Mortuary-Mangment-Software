import React, { useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Tag, Box, Diamond, Maximize2, Paintbrush, Package,
  DollarSign, Image, Save, Loader2, UploadCloud, Truck,
  CheckCircle, XCircle
} from 'lucide-react';
import { Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Enhanced Color Palette ---
const Colors = {
  primaryDark: '#1a202c',
  accentTeal: '#00B894',
  accentOrange: '#FF6B35',
  white: '#FFFFFF',
  lightGray: '#F7FAFC',
  mediumGray: '#E2E8F0',
  darkGray: '#2D3748',
  successGreen: '#38A169',
  dangerRed: '#E53E3E',
  infoBlue: '#3182CE',
  inputBorder: '#CBD5E0',
  inputFocus: '#00B894',
  textMuted: '#718096',
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
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
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

const spin = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

// --- Enhanced Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${Colors.lightGray} 0%, #EDF2F7 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  animation: ${fadeIn} 0.8s ease-out;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
`;

const Card = styled.div`
  background: ${Colors.white};
  border-radius: 1.25rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  width: 100%;
  max-width: 800px;
  border: 1px solid ${Colors.mediumGray};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  ${props => props.blurred && css`
    filter: blur(3px);
    pointer-events: none;
  `}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid ${Colors.mediumGray};
  border-top: 4px solid ${Colors.accentTeal};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${Colors.white};
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 1.5rem;
  text-align: center;
`;

const SuccessNotification = styled.div`
  position: fixed;
  top: 2rem;
  left: 2rem;
  background: ${Colors.successGreen};
  color: ${Colors.white};
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1001;
  animation: ${slideInFromTop} 0.5s ease-out;
  max-width: 400px;
  
  svg {
    font-size: 2rem;
    animation: ${pulse} 2s infinite;
  }
  
  .success-content {
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 700;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }
  }
`;

const ErrorNotification = styled(SuccessNotification)`
  background: ${Colors.dangerRed};
`;

const DebugPanel = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: ${Colors.darkGray};
  color: ${Colors.white};
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  max-width: 300px;
  max-height: 200px;
  overflow: auto;
  z-index: 999;
  
  h5 {
    margin: 0 0 0.5rem 0;
    color: ${Colors.accentOrange};
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: ${Colors.primaryDark};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    
    svg {
      color: ${Colors.accentTeal};
    }
  }
  
  .subtitle {
    color: ${Colors.textMuted};
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.75rem;
  animation: ${slideIn} 0.5s ease-out;

  label {
    font-weight: 600;
    color: ${Colors.darkGray};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
      color: ${Colors.accentOrange};
      font-size: 1.2rem;
    }
    
    .optional-badge {
      margin-left: auto;
      font-size: 0.7rem;
      background: ${Colors.mediumGray};
      color: ${Colors.textMuted};
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }
  }

  .form-control {
    border-radius: 0.75rem;
    border: 2px solid ${Colors.inputBorder};
    padding: 1rem 1.25rem;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;
    background: ${Colors.white};
    font-weight: 500;

    &:focus {
      border-color: ${Colors.inputFocus};
      box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
      transform: translateY(-1px);
    }

    &::placeholder {
      color: ${Colors.textMuted};
      font-weight: 400;
    }
  }

  .form-text {
    color: ${Colors.textMuted};
    font-size: 0.85rem;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 2.5rem;
  border-radius: 0.875rem;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, ${Colors.accentTeal} 0%, #00a382 100%);
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  min-width: 200px;
  margin: 2rem auto 0;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.15),
      0 10px 10px -5px rgba(0, 0, 0, 0.1);
    
    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.3rem;
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  border: 2px dashed ${Colors.mediumGray};
  border-radius: 1rem;
  text-align: center;
  background: ${Colors.lightGray};
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${Colors.textMuted};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${Colors.accentTeal};
    background: ${Colors.white};
    
    .overlay {
      opacity: 1;
    }
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 0.5rem;
    transition: transform 0.3s ease;
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    svg {
      font-size: 3rem;
      opacity: 0.7;
    }
    
    .placeholder-text {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .placeholder-subtext {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 184, 148, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${Colors.mediumGray};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${Colors.primaryDark};
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: ${Colors.accentTeal};
    }
  }
`;

// --- ENHANCED COMPONENT WITH DEBUGGING ---
const RegisterCoffin = () => {
  const fileInputRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState('');

  const [coffinData, setCoffinData] = useState({
    coffin_id: '',
    type: '',
    material: '',
    size: '',
    color: '',
    quantity: '',
    exact_price: '',
    supplier: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Get username from localStorage with fallback
  const getUsername = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || user.name || 'welt';
      }
    } catch (error) {
      console.log('Could not get user from localStorage:', error);
    }
    return 'welt'; // Default fallback
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCoffinData({ ...coffinData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Enhanced validation
    if (!coffinData.type || !coffinData.material || !coffinData.exact_price) {
      setError('Model, Material, and Price are required fields.');
      setLoading(false);
      return;
    }

    if (parseFloat(coffinData.exact_price) <= 0) {
      setError('Price must be greater than 0.');
      setLoading(false);
      return;
    }

    const formData = new FormData();

    // Append all fields that match backend expectations
    Object.keys(coffinData).forEach(key => {
      if (coffinData[key] !== '') {
        formData.append(key, coffinData[key]);
      }
    });

    // Add username/created_by information
    formData.append('created_by', getUsername());

    // Use the correct field name for image upload
    if (imageFile) {
      formData.append('coffin_image', imageFile);
    }

    // Debug: Log FormData contents
    let debugContent = 'FormData Contents:\n';
    for (let [key, value] of formData.entries()) {
      debugContent += `${key}: ${value}\n`;
    }
    setDebugInfo(debugContent);
    setShowDebug(true);

    try {
      console.log('Sending request to server...');
      
      const response = await fetch('http://localhost:5000/api/v1/restpoint/register-coffin', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Unknown server error');
      }

      // Success!
      setSuccessMessage(result.message || 'Coffin registered successfully! ⚰️✅');
      
      // Reset form
      setCoffinData({
        coffin_id: '',
        type: '',
        material: '',
        size: '',
        color: '',
        quantity: '',
        exact_price: '',
        supplier: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-hide success after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err) {
      console.error('Error registering coffin:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Registering Coffin...</LoadingText>
          <LoadingText>Please wait while we save your data</LoadingText>
        </LoadingOverlay>
      )}

      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification>
          <CheckCircle size={32} />
          <div className="success-content">
            <h4>Success!</h4>
            <p>{successMessage}</p>
          </div>
        </SuccessNotification>
      )}

      {/* Error Notification */}
      {error && (
        <ErrorNotification>
          <XCircle size={32} />
          <div className="success-content">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        </ErrorNotification>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <DebugPanel>
          <h5>Debug Info</h5>
          <pre>{debugInfo}</pre>
          <button 
            onClick={() => setShowDebug(false)}
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              marginTop: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </DebugPanel>
      )}

      <Card blurred={loading}>
        <PageHeader>
          <h1>
            <Box /> Register New Coffin
          </h1>
          <div className="subtitle">
            Add coffin details to inventory management system
          </div>
        </PageHeader>

        <Form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <FormSection>
            <div className="section-title">
              <Box /> Basic Information
            </div>
            <Row>
              <Col md={6}>
                <StyledFormGroup controlId="formCoffinId">
                  <Form.Label>
                    <Tag /> Custom ID
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="coffin_id"
                    value={coffinData.coffin_id}
                    onChange={handleInputChange}
                    placeholder="COF-2025-M001"
                  />
                  <Form.Text>
                    Unique identifier for the coffin
                  </Form.Text>
                </StyledFormGroup>
              </Col>
              <Col md={6}>
                <StyledFormGroup controlId="formType">
                  <Form.Label>
                    <Box /> Model *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="type"
                    value={coffinData.type}
                    onChange={handleInputChange}
                    placeholder="Classic Mahogany"
                    required
                  />
                </StyledFormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <StyledFormGroup controlId="formMaterial">
                  <Form.Label>
                    <Diamond /> Material *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="material"
                    value={coffinData.material}
                    onChange={handleInputChange}
                    placeholder="Mahogany Wood"
                    required
                  />
                </StyledFormGroup>
              </Col>
              <Col md={6}>
                <StyledFormGroup controlId="formSupplier">
                  <Form.Label>
                    <Truck /> Supplier
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={coffinData.supplier}
                    onChange={handleInputChange}
                    placeholder="Woodcraft Co."
                  />
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Specifications Section */}
          <FormSection>
            <div className="section-title">
              <Maximize2 /> Specifications
            </div>
            <Row>
              <Col md={6}>
                <StyledFormGroup controlId="formSize">
                  <Form.Label>
                    <Maximize2 /> Size
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="size"
                    value={coffinData.size}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Standard">Standard</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </Form.Control>
                </StyledFormGroup>
              </Col>
              <Col md={6}>
                <StyledFormGroup controlId="formColor">
                  <Form.Label>
                    <Paintbrush /> Color
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={coffinData.color}
                    onChange={handleInputChange}
                    placeholder="Dark Brown"
                  />
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Pricing & Inventory Section */}
          <FormSection>
            <div className="section-title">
              <DollarSign /> Pricing & Inventory
            </div>
            <Row>
              <Col md={6}>
                <StyledFormGroup controlId="formExactPrice">
                  <Form.Label>
                    <DollarSign /> Price *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="exact_price"
                    value={coffinData.exact_price}
                    onChange={handleInputChange}
                    placeholder="25000.00"
                    required
                    min="0"
                    step="0.01"
                  />
                  <Form.Text>
                    Enter price in local currency
                  </Form.Text>
                </StyledFormGroup>
              </Col>
              <Col md={6}>
                <StyledFormGroup controlId="formQuantity">
                  <Form.Label>
                    <Package /> Stock Quantity
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={coffinData.quantity}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                  />
                  <Form.Text>
                    Defaults to 1 if not specified
                  </Form.Text>
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Image Upload Section */}
          <FormSection>
            <div className="section-title">
              <Image /> Coffin Image
            </div>
            <Row>
              <Col md={12}>
                <StyledFormGroup controlId="formImageFile">
                  <Form.Label>
                    <Image /> Coffin Image Upload
                    <Badge className="optional-badge">Optional</Badge>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="coffin_image"
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  
                  <ImagePreviewContainer onClick={handleImageClick}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Coffin Preview" />
                        <div className="overlay">
                          Click to change image
                        </div>
                      </>
                    ) : (
                      <div className="placeholder-content">
                        <UploadCloud size={48} />
                        <div className="placeholder-text">Upload Coffin Image</div>
                        <div className="placeholder-subtext">
                          Click to browse or drag and drop
                        </div>
                        <div className="placeholder-subtext" style={{ fontSize: '0.75rem' }}>
                          PNG, JPG, JPEG up to 5MB
                        </div>
                      </div>
                    )}
                  </ImagePreviewContainer>
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save />
                Register Coffin
              </>
            )}
          </PrimaryButton>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default RegisterCoffin;