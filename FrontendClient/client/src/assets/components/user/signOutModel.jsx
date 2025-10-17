import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';
import SignaturePad from 'react-signature-pad-wrapper';
import { X, Save, User as UserIcon, CreditCard, Phone, Calendar } from 'react-feather';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E293B;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #E2E8F0;
  }
`;

const SignatureContainer = styled.div`
  border: 2px solid #CBD5E1;
  border-radius: 0.5rem;
  height: 200px;
  width: 100%;
  cursor: crosshair;
  background-color: #F8FAFC;
  position: relative;
  overflow: hidden;
`;

const SignatureActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ClearButton = styled.button`
  background: none;
  border: 1px solid #DC2626;
  color: #DC2626;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #DC2626;
    color: white;
  }
`;

const SaveButton = styled.button`
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
    background: #3B82F6;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #F8FAFC;
  transition: all 0.3s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RequiredIndicator = styled.span`
  color: #DC2626;
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

const SignaturePlaceholder = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  font-style: italic;
  pointer-events: none;
`;

// Main Component
export default function SignOutModal({ deceasedId, onClose }) {
  const sigPad = useRef(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientID, setRecipientID] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);

  // Optimized signature handlers
  const clearSignature = useCallback(() => {
    if (sigPad.current) {
      sigPad.current.clear();
      setSignatureEmpty(true);
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

  const saveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty() || !recipientName || !recipientID || !recipientPhone || !collectionDate) {
      toast.error("Please provide all required details and a signature.");
      return;
    }

    setIsSaving(true);
    
    try {
      // Get signature as data URL with optimization
      const signatureImage = sigPad.current.toDataURL('image/png');
      
      const payload = {
        deceasedId: deceasedId,
        recipientName,
        recipientID,
        recipientPhone,
        collectionDate,
        signature: signatureImage
      };

      const response = await axios.post('http://localhost:5000/api/v1/restpoint/deceased/sign-out', payload);

      if (response.data.success) {
        toast.success("Deceased body signed out successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Failed to sign out body.");
      }
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error("Error processing sign-out. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Format today's date for the date input
  const today = new Date().toISOString().split('T')[0];

  // Check if form is complete
  const isFormComplete = recipientName && recipientID && recipientPhone && collectionDate && !signatureEmpty;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <UserIcon size={24} /> Deceased Sign Out
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <FormGroup>
          <Label>
            <UserIcon size={16} /> 
            Recipient's Full Name
            <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <Input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g., P.mumo"
            required
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>
              <CreditCard size={16} /> 
              ID Number
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              value={recipientID}
              onChange={(e) => setRecipientID(e.target.value)}
              placeholder="e.g., 12345678"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Phone size={16} /> 
              Phone Number
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g., 0712345678"
              required
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>
            <Calendar size={16} /> 
            Collection Date
            <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <Input
            type="date"
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            min={today}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>
            Signature
            <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <SignatureContainer>
            <SignaturePad
              ref={sigPad}
              options={{
                minWidth: 1,
                maxWidth: 3,
                penColor: 'black',
                onBegin: handleSignatureBegin,
                onEnd: handleSignatureEnd
              }}
              redrawOnResize={true}
              style={{ width: '100%', height: '100%' }}
            />
            {signatureEmpty && (
              <SignaturePlaceholder>
                Sign here...
              </SignaturePlaceholder>
            )}
          </SignatureContainer>
        </FormGroup>

        <SignatureActions>
          <ClearButton onClick={clearSignature}>
            <X size={16} /> Clear Signature
          </ClearButton>
          <SaveButton 
            onClick={saveSignature} 
            disabled={!isFormComplete || isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner /> Processing...
              </>
            ) : (
              <>
                <Save size={16} /> Confirm Body Collection
              </>
            )}
          </SaveButton>
        </SignatureActions>
      </ModalContent>
    </ModalOverlay>
  );
}