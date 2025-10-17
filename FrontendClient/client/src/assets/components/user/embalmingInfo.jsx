import React, { useState } from 'react';
import styled from 'styled-components';
import { FlaskConical, Save, X, DollarSign, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  border: 1px solid #CBD5E1;
  color: #334155;
  margin-bottom: 1.5rem;

`;

const CardTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1E293B;

  svg {
    stroke-width: 2.5;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #F8FAFC;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #F8FAFC;
  transition: all 0.3s ease;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-weight: 600;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: #64748B;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #64748B;
  border: 2px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #F8FAFC;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background-color: ${props => props.embalmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)'};
  color: ${props => props.embalmed ? '#10B981' : '#F87171'};
  border: 1px solid ${props => props.embalmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'};
`;

const EmbalmingInfoSection = ({ deceased, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isEmbalmed: deceased.is_embalmed || false,
    embalmedBy: deceased.embalmed_by || '',
    embalmingRemarks: deceased.embalming_remarks || '',
    embalmingCost: deceased.embalming_cost || ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/restpoint/update-embalming/${deceased.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Embalming information updated successfully');
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.message || 'Failed to update embalming information');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      isEmbalmed: deceased.is_embalmed || false,
      embalmedBy: deceased.embalmed_by || '',
      embalmingRemarks: deceased.embalming_remarks || '',
      embalmingCost: deceased.embalming_cost || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not embalmed';
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardTitle>
        <FlaskConical size={20} />
        Embalming Information
      </CardTitle>

      <StatusBadge embalmed={deceased.is_embalmed}>
        <FlaskConical size={16} />
        {deceased.is_embalmed ? 'Embalmed' : 'Not Embalmed'}
        {deceased.embalmed_at && ` on ${formatDate(deceased.embalmed_at)}`}
      </StatusBadge>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="isEmbalmed"
              name="isEmbalmed"
              checked={formData.isEmbalmed}
              onChange={handleInputChange}
            />
            <CheckboxLabel htmlFor="isEmbalmed">
              Deceased has been embalmed
            </CheckboxLabel>
          </CheckboxContainer>

          {formData.isEmbalmed && (
            <>
              <FormGroup>
                <Label>
                  <User size={16} />
                  Embalmed By
                </Label>
                <Input
                  type="text"
                  name="embalmedBy"
                  value={formData.embalmedBy}
                  onChange={handleInputChange}
                  placeholder="Enter embalmer's name"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <DollarSign size={16} />
                  Embalming Cost (Ksh)
                </Label>
                <Input
                  type="number"
                  name="embalmingCost"
                  value={formData.embalmingCost}
                  onChange={handleInputChange}
                  placeholder="Enter cost"
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>Remarks</Label>
                <TextArea
                  name="embalmingRemarks"
                  value={formData.embalmingRemarks}
                  onChange={handleInputChange}
                  placeholder="Add any remarks about the embalming process"
                />
              </FormGroup>
            </>
          )}

          <ButtonGroup>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
              {!isLoading && <Save size={16} />}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={handleCancel}>
              Cancel
              <X size={16} />
            </SecondaryButton>
          </ButtonGroup>
        </form>
      ) : (
        <>
          {deceased.is_embalmed && (
            <div>
              <FormGroup>
                <Label>Embalmed By:</Label>
                <div>{deceased.embalmed_by || 'Not specified'}</div>
              </FormGroup>

              <FormGroup>
                <Label>Embalming Cost:</Label>
                <div>{deceased.embalming_cost ? `Ksh ${parseFloat(deceased.embalming_cost).toLocaleString()}` : 'Not specified'}</div>
              </FormGroup>

              <FormGroup>
                <Label>Remarks:</Label>
                <div>{deceased.embalming_remarks || 'No remarks'}</div>
              </FormGroup>

              <FormGroup>
                <Label>Embalmed At:</Label>
                <div>{formatDate(deceased.embalmed_at)}</div>
              </FormGroup>
            </div>
          )}

          <PrimaryButton onClick={() => setIsEditing(true)}>
            {deceased.is_embalmed ? 'Edit Embalming Info' : 'Mark as Embalmed'}
            <FlaskConical size={16} />
          </PrimaryButton>
        </>
      )}
    </Card>
  );
};

export default EmbalmingInfoSection;