import React, { useState } from 'react';
import styled from 'styled-components';
import { FlaskConical, Save, X, FileText, User, Building, Calendar, AlertCircle, Plus, Trash2 } from 'lucide-react';

// Styled Components
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background-color: #4299e1;
    color: white;
    border: none;
    
    &:hover {
      background-color: #3182ce;
    }
  }
  
  &.secondary {
    background-color: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background-color: #f7fafc;
    }
  }
  
  &.success {
    background-color: #48bb78;
    color: white;
    border: none;
    
    &:hover {
      background-color: #38a169;
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fed7d7;
  color: #c53030;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #c6f6d5;
  color: #2f855a;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const FindingsContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FindingItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const FindingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #fed7d7;
  }
`;

const AddFindingButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #edf2f7;
  border: 1px dashed #cbd5e0;
  border-radius: 6px;
  padding: 10px 16px;
  color: #4a5568;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
  
  &:hover {
    background-color: #e2e8f0;
  }
`;

const PostmortemInfoSection = ({ deceasedId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    deceased_id: deceasedId,
    summary: '',
    findings: [
      { title: 'Head & Brain', description: '' },
      { title: 'Chest & Thoracic Organs', description: '' },
      { title: 'Abdomen & Pelvic Organs', description: '' },
      { title: 'Extremities & Musculoskeletal', description: '' },
      { title: 'Toxicology & Lab Results', description: '' }
    ],
    cause_of_death: '',
    pathologist_name: '',
    mortuary_name: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFindingTitleChange = (index, value) => {
    const updatedFindings = [...formData.findings];
    updatedFindings[index].title = value;
    setFormData(prev => ({
      ...prev,
      findings: updatedFindings
    }));
  };

  const handleFindingDescriptionChange = (index, value) => {
    const updatedFindings = [...formData.findings];
    updatedFindings[index].description = value;
    setFormData(prev => ({
      ...prev,
      findings: updatedFindings
    }));
  };

  const addFinding = () => {
    setFormData(prev => ({
      ...prev,
      findings: [...prev.findings, { title: '', description: '' }]
    }));
  };

  const removeFinding = (index) => {
    if (formData.findings.length <= 1) return;
    
    const updatedFindings = [...formData.findings];
    updatedFindings.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      findings: updatedFindings
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.summary) newErrors.summary = 'Summary is required';
    if (!formData.cause_of_death) newErrors.cause_of_death = 'Cause of death is required';
    if (!formData.pathologist_name) newErrors.pathologist_name = 'Pathologist name is required';
    if (!formData.mortuary_name) newErrors.mortuary_name = 'Mortuary name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    // Validate findings
    formData.findings.forEach((finding, index) => {
      if (!finding.title) {
        newErrors[`finding_title_${index}`] = `Finding title #${index + 1} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Convert findings array to object format expected by API
      const findingsObject = {};
      formData.findings.forEach(finding => {
        findingsObject[finding.title] = finding.description;
      });
      
      const submissionData = {
        deceased_id: formData.deceased_id,
        summary: formData.summary,
        findings: findingsObject,
        cause_of_death: formData.cause_of_death,
        pathologist_name: formData.pathologist_name,
        mortuary_name: formData.mortuary_name,
        date: formData.date
      };
      
      // This would be your API call to save the postmortem data
      const response = await fetch('http://localhost:5000/api/v1/restpoint/postmortem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        if (onSave) onSave();
      } else {
        throw new Error('Failed to save postmortem data');
      }
    } catch (error) {
      console.error('Error saving postmortem data:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <h2><FlaskConical size={24} /> Postmortem Examination</h2>
      </Header>
      
      {submitStatus === 'success' && (
        <SuccessMessage>
          <AlertCircle size={18} /> Postmortem data saved successfully!
        </SuccessMessage>
      )}
      
      {submitStatus === 'error' && (
        <ErrorMessage>
          <AlertCircle size={18} /> Error saving postmortem data. Please try again.
        </ErrorMessage>
      )}
      
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <h3><FileText size={18} /> Examination Details</h3>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="deceased_id">Deceased ID</Label>
                <Input
                  type="text"
                  id="deceased_id"
                  name="deceased_id"
                  value={formData.deceased_id}
                  onChange={handleInputChange}
                  disabled
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="date">Examination Date</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && <span style={{color: 'red', fontSize: '12px'}}>{errors.date}</span>}
              </FormGroup>
            </FormGrid>
            
            <FormGroup>
              <Label htmlFor="summary">Examination Summary</Label>
              <TextArea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Provide a comprehensive summary of the postmortem examination..."
                required
              />
              {errors.summary && <span style={{color: 'red', fontSize: '12px'}}>{errors.summary}</span>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="cause_of_death">Cause of Death</Label>
              <Input
                type="text"
                id="cause_of_death"
                name="cause_of_death"
                value={formData.cause_of_death}
                onChange={handleInputChange}
                placeholder="Primary cause of death..."
                required
              />
              {errors.cause_of_death && <span style={{color: 'red', fontSize: '12px'}}>{errors.cause_of_death}</span>}
            </FormGroup>
          </FormSection>
          
          <FormSection>
            <h3><FileText size={18} /> Examination Findings</h3>
            <p style={{color: '#6b7280', fontSize: '14px', marginBottom: '16px'}}>
              Add examination findings by category. You can customize the category names and add as many as needed.
            </p>
            
            <FindingsContainer>
              {formData.findings.map((finding, index) => (
                <FindingItem key={index}>
                  <FindingHeader>
                    <FormGroup style={{flex: 1, marginBottom: '8px'}}>
                      <Label htmlFor={`finding-title-${index}`}>Finding Category {index + 1}</Label>
                      <Input
                        type="text"
                        id={`finding-title-${index}`}
                        value={finding.title}
                        onChange={(e) => handleFindingTitleChange(index, e.target.value)}
                        placeholder="e.g., Head & Brain, Chest & Thoracic Organs, etc."
                        required
                      />
                      {errors[`finding_title_${index}`] && (
                        <span style={{color: 'red', fontSize: '12px'}}>
                          {errors[`finding_title_${index}`]}
                        </span>
                      )}
                    </FormGroup>
                    
                    {formData.findings.length > 1 && (
                      <RemoveButton 
                        type="button" 
                        onClick={() => removeFinding(index)}
                        title="Remove this finding"
                      >
                        <Trash2 size={16} />
                      </RemoveButton>
                    )}
                  </FindingHeader>
                  
                  <FormGroup>
                    <Label htmlFor={`finding-description-${index}`}>Findings Description</Label>
                    <TextArea
                      id={`finding-description-${index}`}
                      value={finding.description}
                      onChange={(e) => handleFindingDescriptionChange(index, e.target.value)}
                      placeholder="Enter detailed findings for this category..."
                    />
                  </FormGroup>
                </FindingItem>
              ))}
              
              <AddFindingButton type="button" onClick={addFinding}>
                <Plus size={16} /> Add Another Finding Category
              </AddFindingButton>
            </FindingsContainer>
          </FormSection>
          
          <FormSection>
            <h3><User size={18} /> Personnel Information</h3>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="pathologist_name">Pathologist Name</Label>
                <Input
                  type="text"
                  id="pathologist_name"
                  name="pathologist_name"
                  value={formData.pathologist_name}
                  onChange={handleInputChange}
                  placeholder="Full name of examining pathologist"
                  required
                />
                {errors.pathologist_name && <span style={{color: 'red', fontSize: '12px'}}>{errors.pathologist_name}</span>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="mortuary_name">Mortuary Name</Label>
                <Input
                  type="text"
                  id="mortuary_name"
                  name="mortuary_name"
                  value={formData.mortuary_name}
                  onChange={handleInputChange}
                  placeholder="Name of the mortuary facility"
                  required
                />
                {errors.mortuary_name && <span style={{color: 'red', fontSize: '12px'}}>{errors.mortuary_name}</span>}
              </FormGroup>
            </FormGrid>
          </FormSection>
          
          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onCancel}>
              <X size={16} /> Cancel
            </Button>
            <Button type="submit" className="primary" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Postmortem'}
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Container>
  );
};


export default PostmortemInfoSection;