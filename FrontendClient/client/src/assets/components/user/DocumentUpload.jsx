import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, Image, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

// Sleek Styled Components
const Card = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #E2E8F0;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E293B;
`;

const UploadTypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #F8FAFC;
  padding: 0.25rem;
  border-radius: 8px;
`;

const UploadTypeButton = styled.button`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? '#4F46E5' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748B'};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;

  &:hover {
    background: ${props => props.active ? '#4338CA' : '#F1F5F9'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.375rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1.5px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const FileInputArea = styled.div`
  border: 2px dashed ${props => props.hasFile ? '#059669' : '#D1D5DB'};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  background: ${props => props.hasFile ? '#F0FDF4' : '#F9FAFB'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #4F46E5;
    background: #F8FAFC;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  position: relative;
`;

const RemoveFileButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;

  &:hover {
    background: #DC2626;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FileIcon = styled.div`
  color: #6B7280;
`;

const FileDetails = styled.div`
  text-align: left;
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const FileSize = styled.div`
  color: #6B7280;
  font-size: 0.75rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${props => props.disabled ? '#9CA3AF' : '#4F46E5'};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #4338CA;
    transform: translateY(-1px);
  }
`;

const StatusMessage = styled.div`
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  background: ${props => 
    props.status === 'success' ? '#D1FAE5' : 
    props.status === 'error' ? '#FEE2E2' : 
    '#FEF3C7'
  };
  color: ${props => 
    props.status === 'success' ? '#065F46' : 
    props.status === 'error' ? '#991B1B' : 
    '#92400E'
  };
`;

const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

const DocumentUpload = ({ deceasedId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState('document');
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    console.log('DocumentUpload - deceasedId:', deceasedId);
  }, [deceasedId]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    console.log('Selected file:', selectedFile);

    // Validate file type
    const allowedTypes = uploadType === 'document' 
      ? [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'application/zip',
          'application/x-rar-compressed'
        ]
      : ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(`Please select a valid ${uploadType === 'document' ? 'document' : 'image'} file`);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!deceasedId) {
      toast.error('Deceased data not loaded');
      return;
    }

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (uploadType === 'document' && !documentType) {
      toast.error('Please select document type');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('files', file);
      
      if (uploadType === 'document') {
        formData.append('type', documentType);
      }

      console.log('Uploading to deceased_idd:', deceasedId);

      const response = await fetch(`${API_BASE_URL}/deceased/${deceasedId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (response.ok && result.success) {
        setUploadStatus('success');
        toast.success(result.message || 'File uploaded successfully');
        resetForm();
        if (onUploadSuccess) onUploadSuccess(result);
      } else {
        throw new Error(result.message || `Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType('');
    setUploadStatus(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setFile(null);
    setDocumentType('');
    setUploadStatus(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const getFileAccept = () => {
    return uploadType === 'document' 
      ? '.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.zip,.rar'
      : 'image/*';
  };

  const getFileTypeText = () => {
    return uploadType === 'document' 
      ? 'PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, ZIP, RAR'
      : 'JPG, PNG, GIF';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSubmitDisabled = isUploading || !file || (uploadType === 'document' && !documentType) || !deceasedId;

  return (
    <Card>
      <CardTitle>
        <Upload size={18} />
        Upload Documents
      </CardTitle>

      {!deceasedId && (
        <StatusMessage status="error">
          <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Waiting for deceased data to load...
        </StatusMessage>
      )}

      <UploadTypeSelector>
        <UploadTypeButton
          active={uploadType === 'document'}
          onClick={() => handleUploadTypeChange('document')}
        >
          <FileText size={16} />
          Documents
        </UploadTypeButton>
        <UploadTypeButton
          active={uploadType === 'image'}
          onClick={() => handleUploadTypeChange('image')}
        >
          <Image size={16} />
          Images
        </UploadTypeButton>
      </UploadTypeSelector>

      <form onSubmit={handleUpload}>
        {uploadType === 'document' && (
          <FormGroup>
            <Label>Document Type</Label>
            <Select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={!deceasedId}
            >
              <option value="">Select type...</option>
              <option value="PDF Document">PDF Document</option>
              <option value="Word Document">Word Document</option>
              <option value="Excel Spreadsheet">Excel Spreadsheet</option>
              <option value="Text File">Text File</option>
              <option value="CSV File">CSV File</option>
              <option value="Archive">Archive (ZIP/RAR)</option>
            </Select>
          </FormGroup>
        )}

        <FormGroup>
          <Label>Select File ({getFileTypeText()})</Label>
          <FileInputArea 
            hasFile={!!file}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <FileInput
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept={getFileAccept()}
            />
            {!file ? (
              <div>
                <Upload size={24} color="#6B7280" />
                <div style={{ marginTop: '0.5rem', color: '#6B7280', fontSize: '0.875rem' }}>
                  Click to select file
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {getFileTypeText()}
                </div>
              </div>
            ) : (
              <FilePreview>
                <RemoveFileButton 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X size={12} />
                </RemoveFileButton>
                <FileInfo>
                  <FileIcon>
                    <FileText size={20} />
                  </FileIcon>
                  <FileDetails>
                    <FileName>{file.name}</FileName>
                    <FileSize>{formatFileSize(file.size)} • {file.type}</FileSize>
                  </FileDetails>
                </FileInfo>
              </FilePreview>
            )}
          </FileInputArea>
        </FormGroup>

        {uploadStatus && (
          <StatusMessage status={uploadStatus}>
            {uploadStatus === 'uploading' && 'Uploading file...'}
            {uploadStatus === 'success' && 'File uploaded successfully!'}
            {uploadStatus === 'error' && 'Upload failed. Please try again.'}
          </StatusMessage>
        )}

        <SubmitButton 
          type="submit" 
          disabled={isSubmitDisabled}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload {uploadType === 'document' ? 'Document' : 'Image'}
            </>
          )}
        </SubmitButton>
      </form>
    </Card>
  );
};

export default DocumentUpload;