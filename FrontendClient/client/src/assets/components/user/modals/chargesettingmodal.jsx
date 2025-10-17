import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DollarSign, Save, X, Tag, Clock } from "lucide-react";
import { toast } from "react-toastify";
// NOTE: Assuming bootstrap is available or styling is handled by styled-components

// 🎨 Color constants (Updated for a 'cool' violet theme)
const Colors = {
  primaryColor: "#6B46C1", // Deep Violet for a premium, cool look
  secondaryColor: "#4C327A", // Darker Violet for hover states
  lightBackground: "#F9FBFC", // Softer light background
  darkGray: "#343A40",
  mediumGray: "#6C757D",
  textMuted: "#A0AEC0", // Softer gray for less focus text
  successGreen: "#28A745",
  dangerRed: "#DC3545",
  borderLight: "#E3E8EC",
  highlightColor: "#EDE9FE", // Very light violet for softer backgrounds
};

// ===============================
// Styled Components
// ===============================
// Kept ModalOverlay functional but made the Content softer
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65); // Slightly darker overlay
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(5px); // Enhanced blur
`;

export const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px; // More rounded
  padding: 2rem; // Increased padding
  width: 100%;
  max-width: 750px; /* Widened the modal */
  /*     THE FIX: Set max-height to a value less than 100vh. 
    90vh (Viewport Height) ensures the modal never exceeds the screen height, 
    which is necessary to trigger the internal scrollbar when content is large.
  */
  max-height: 90vh; /* Corrected max height to allow scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
  box-shadow: 0 15px 40px rgba(107, 70, 193, 0.2), 0 0 0 1px ${Colors.borderLight}; // Shadow based on primary color
  position: relative;
  transition: transform 0.3s ease-out;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem; // Increased margin
`;

export const ModalTitle = styled.h4` // Changed to h4 for better visual weight
  font-weight: 700;
  color: ${Colors.primaryColor}; /* Title color matches the new theme */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${Colors.textMuted};
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: ${Colors.dangerRed};
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem; // Slightly more vertical space
`;

export const Label = styled.label`
  font-weight: 600; // Bolder label
  margin-bottom: 0.4rem;
  display: block;
  color: ${Colors.darkGray};
  font-size: 0.95rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem; // Increased padding for touch/click targets
  border: 1px solid ${Colors.borderLight};
  border-radius: 8px; // More rounded input
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${Colors.primaryColor}; /* Focus ring color update */
    box-shadow: 0 0 0 3px ${Colors.highlightColor}; // Soft focus ring
  }
`;

export const Select = styled(Input).attrs({ as: 'select' })`
  appearance: none; // Remove default select arrow
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem; // Space for the custom arrow
`;


export const SubmitButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  /* Added a subtle gradient for a premium look */
  background: linear-gradient(145deg, ${Colors.primaryColor}, ${Colors.secondaryColor}); 
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 70, 193, 0.4); /* Shadow based on primary color */
  margin-top: 1.5rem;
  
  &:hover {
    background: ${Colors.secondaryColor}; /* Solid darker color on hover */
    box-shadow: 0 6px 20px rgba(107, 70, 193, 0.6);
    transform: translateY(-1px);
  }
  &:disabled {
    background: ${Colors.mediumGray};
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

// New style for the summary box
export const SummaryBox = styled.div`
  background-color: ${Colors.highlightColor}; /* Light violet background */
  border: 1px solid rgba(107, 70, 193, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0 1rem 0;
`;

export const SummaryItem = styled.p`
  display: flex;
  align-items: center;
  margin: 0.4rem 0;
  color: ${Colors.darkGray};
  font-size: 0.95rem;
  font-weight: ${({ bold }) => (bold ? 600 : 400)};

  svg {
    margin-right: 0.5rem;
    color: ${Colors.primaryColor}; /* Icons match the new theme */
  }
`;

// ===============================
// MAIN COMPONENT
// ===============================
const ChargeSettingsModal = ({ isOpen, onClose, deceasedData, onUpdate }) => {
  const [chargeSettings, setChargeSettings] = useState({
    chargeType: "daily",
    rateProfile: "Standard", // New field for client differentiation
    currency: "KES",
    dailyRate: 800,
    hourlyRate: 100,
    usdRate: 130,
  });

  const [loading, setLoading] = useState(false);

  // Initialize state when modal opens or deceasedData changes
  useEffect(() => {
    if (isOpen && deceasedData) {
      setChargeSettings({
        chargeType: deceasedData.chargeType || "daily",
        rateProfile: deceasedData.rateProfile || "Standard", // Load existing profile
        currency: deceasedData.currency || "KES",
        // Ensure rates are numbers, defaulting if undefined
        dailyRate: Number(deceasedData.dailyRate) || 800,
        hourlyRate: Number(deceasedData.hourlyRate) || 100,
        usdRate: Number(deceasedData.usdRate) || 130,
      });
    }
  }, [isOpen, deceasedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric inputs to numbers
    const finalValue = (name === 'dailyRate' || name === 'hourlyRate' || name === 'usdRate') 
      ? Number(value) 
      : value;

    setChargeSettings((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!deceasedData || !deceasedData.id) {
      toast.error("Deceased data or ID is missing. Cannot save settings.");
      setLoading(false);
      return;
    }

    try {
      // Data validation before sending
      if (chargeSettings.chargeType === "daily" && (!chargeSettings.dailyRate || chargeSettings.dailyRate <= 0)) {
        throw new Error("Daily Rate must be a positive number.");
      }
      if (chargeSettings.chargeType === "hourly" && (!chargeSettings.hourlyRate || chargeSettings.hourlyRate <= 0)) {
        throw new Error("Hourly Rate must be a positive number.");
      }
      if (chargeSettings.currency === "USD" && (!chargeSettings.usdRate || chargeSettings.usdRate <= 0)) {
        throw new Error("USD Exchange Rate must be a positive number.");
      }

      // NOTE: Using a mock fetch URL. Replace with actual API endpoint in a real application.
      const response = await fetch(
        `http://localhost:5000/api/v1/restpoint/update-charge-settings/${deceasedData.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send all settings including the new rateProfile
          body: JSON.stringify(chargeSettings),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Charge settings updated successfully");
        onClose();
        if (onUpdate) onUpdate(); // Trigger parent component refresh
      } else {
        throw new Error(result.message || "Failed to update charge settings");
      }
    } catch (error) {
      // NOTE: toast.error is assumed to be defined by a parent component
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: chargeSettings.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const displayRate = chargeSettings.chargeType === "daily" 
    ? chargeSettings.dailyRate 
    : chargeSettings.hourlyRate;
  
  const formattedRate = formatter.format(displayRate);


  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <DollarSign size={24} /> Billing Configuration
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={22} />
          </CloseButton>
        </ModalHeader>
        
        <p style={{ color: Colors.mediumGray, margin: "0 0 1.5rem 0", fontSize: "0.95rem" }}>
          Set custom rate profile and billing details for **{deceasedData?.full_name || 'this client'}**.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Rate Profile and Currency Group - Responsive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
             <FormGroup>
                <Label>Rate Profile</Label>
                <Select
                  name="rateProfile"
                  value={chargeSettings.rateProfile}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard Rate</option>
                  <option value="Premium">Premium Client</option>
                  <option value="Discount">Discounted/Special</option>
                  <option value="Government">Government/NGO</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Currency</Label>
                <Select
                  name="currency"
                  value={chargeSettings.currency}
                  onChange={handleInputChange}
                >
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                </Select>
              </FormGroup>
          </div>

          <FormGroup>
            <Label>Charge Frequency</Label>
            <Select
              name="chargeType"
              value={chargeSettings.chargeType}
              onChange={handleInputChange}
            >
              <option value="daily">Daily Rate</option>
              <option value="hourly">Hourly Rate</option>
            </Select>
          </FormGroup>

          {/* Conditional Rate Inputs */}
          {chargeSettings.chargeType === "daily" && (
            <FormGroup>
              <Label>Daily Rate ({chargeSettings.currency})</Label>
              <Input
                type="number"
                name="dailyRate"
                value={chargeSettings.dailyRate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder={`e.g. 800 ${chargeSettings.currency}`}
              />
            </FormGroup>
          )}

          {chargeSettings.chargeType === "hourly" && (
            <FormGroup>
              <Label>Hourly Rate ({chargeSettings.currency})</Label>
              <Input
                type="number"
                name="hourlyRate"
                value={chargeSettings.hourlyRate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder={`e.g. 100 ${chargeSettings.currency}`}
              />
            </FormGroup>
          )}

          {chargeSettings.currency === "USD" && (
            <FormGroup>
              <Label>USD to KES Exchange Rate</Label>
              <Input
                type="number"
                name="usdRate"
                value={chargeSettings.usdRate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="e.g. 130"
              />
            </FormGroup>
          )}

          {/* Summary */}
          <SummaryBox>
            <h5 style={{ margin: "0 0 0.8rem 0", color: Colors.secondaryColor, fontWeight: 800, fontSize: '1.1rem' }}>
              Current Billing Summary
            </h5>
            
            <SummaryItem bold>
              <Tag size={18} /> 
              Rate Profile: {chargeSettings.rateProfile}
            </SummaryItem>
            
            <SummaryItem bold>
              <DollarSign size={18} /> 
              Current Rate: {formattedRate} / {chargeSettings.chargeType === 'daily' ? 'Day' : 'Hour'}
            </SummaryItem>
            
            {chargeSettings.currency === "USD" && (
              <SummaryItem style={{ color: Colors.mediumGray, fontSize: '0.85rem', marginTop: '0.8rem' }}>
                <Clock size={16} /> 
                Exchange: 1 USD = {chargeSettings.usdRate} KES
              </SummaryItem>
            )}
          </SummaryBox>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Save Configuration"}
            {!loading && <Save size={18} />}
          </SubmitButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChargeSettingsModal;