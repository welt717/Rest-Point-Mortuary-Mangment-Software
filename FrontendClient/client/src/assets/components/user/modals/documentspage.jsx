import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, FileText, Download, Eye, Trash2, User, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

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
  flex-wrap: wrap;
  gap: 1rem;
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

const DocumentCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #3b82f6;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const DocumentDetails = styled.div`
  flex: 1;
`;

const DocumentName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
`;

const DocumentMeta = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.bgColor || '#3b82f6'};
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.hoverColor || '#2563eb'};
    transform: translateY(-2px);
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.bgColor};
  color: ${props => props.color};
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DocumentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/restpoint/deceased-id?id=${id}`);
      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
        setDocuments(response.data.data.documents || []);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
      setIsLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      // Implement actual download logic
      // For now, simulate download
      toast.info(`Downloading ${document.name || document.filename || 'document'}...`);
      
      // If document has a URL, open it in new tab for download
      if (document.url || document.download_url) {
        window.open(document.url || document.download_url, '_blank');
      } else {
        // Create a dummy download for demo
        const blob = new Blob(['Document content would be here'], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.name || document.filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleView = (document) => {
    try {
      // Implement view logic - open in new tab or modal
      if (document.url || document.view_url) {
        window.open(document.url || document.view_url, '_blank');
        toast.info(`Opening ${document.name || document.filename || 'document'}...`);
      } else {
        // For demo purposes, show a message
        toast.info(`Viewing ${document.name || document.filename || 'document'}...`);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleDelete = async (documentId, documentName) => {
    if (window.confirm(`Are you sure you want to delete "${documentName}"? This action cannot be undone.`)) {
      try {
        // Implement actual delete API call
        // await axios.delete(`http://localhost:5000/api/v1/restpoint/delete-document/${documentId}`);
        
        // For now, simulate deletion
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FileText size={32} color="#3b82f6" />;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText size={32} color="#ef4444" />;
      case 'doc':
      case 'docx':
        return <FileText size={32} color="#2563eb" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText size={32} color="#10b981" />;
      case 'xls':
      case 'xlsx':
        return <FileText size={32} color="#059669" />;
      default:
        return <FileText size={32} color="#3b82f6" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState>
          <Spinner />
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading documents...</p>
        </LoadingState>
      </PageContainer>
    );
  }

  const hasDocuments = documents.length > 0;

  return (
    <PageContainer>
      <ToastContainer position="top-right" autoClose={5000} />
      
      <Header>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText size={32} />
            Documents Management
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
            Managing documents for: <strong>{deceasedData?.full_name || 'Unknown'}</strong> (ID: {id})
          </p>
          {deceasedData && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge bgColor="#f0f9ff" color="#0369a1">
                <User size={16} />
                {deceasedData.gender || 'Unknown'} • {deceasedData.age || 'N/A'} years
              </StatusBadge>
              <StatusBadge bgColor={hasDocuments ? "#f0fdf4" : "#fef3c7"} color={hasDocuments ? "#059669" : "#d97706"}>
                {hasDocuments ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {hasDocuments ? `${documents.length} document(s)` : 'No documents'}
              </StatusBadge>
            </div>
          )}
        </div>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back to Details
        </BackButton>
      </Header>

      <ContentCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>
              All Documents ({documents.length})
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
              View, download, or manage documents for this deceased
            </p>
          </div>
        </div>

        {!hasDocuments ? (
          <EmptyState>
            <FileText size={80} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>No Documents Found</h3>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              There are no documents uploaded for {deceasedData?.full_name || 'this deceased'}.
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
              Documents can be uploaded from the main deceased details page.
            </p>
          </EmptyState>
        ) : (
          <div>
            {documents.map((doc, index) => (
              <DocumentCard key={doc.id || index}>
                <DocumentInfo>
                  {getFileIcon(doc.name || doc.filename)}
                  <DocumentDetails>
                    <DocumentName>
                      {doc.name || doc.filename || `Document ${index + 1}`}
                    </DocumentName>
                    <DocumentMeta>
                      {doc.upload_date && (
                        <span>Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</span>
                      )}
                      {doc.created_at && (
                        <span>Created: {new Date(doc.created_at).toLocaleDateString()}</span>
                      )}
                      {doc.file_size && (
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                      )}
                      {doc.document_type && (
                        <span>Type: {doc.document_type}</span>
                      )}
                    </DocumentMeta>
                    {doc.description && (
                      <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        {doc.description}
                      </p>
                    )}
                  </DocumentDetails>
                </DocumentInfo>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleView(doc)}
                    bgColor="#3b82f6"
                    hoverColor="#2563eb"
                    title="View Document"
                  >
                    <Eye size={18} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDownload(doc)}
                    bgColor="#10b981"
                    hoverColor="#059669"
                    title="Download Document"
                  >
                    <Download size={18} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDelete(doc.id, doc.name || doc.filename)}
                    bgColor="#ef4444"
                    hoverColor="#dc2626"
                    title="Delete Document"
                  >
                    <Trash2 size={18} />
                  </ActionButton>
                </ActionButtons>
              </DocumentCard>
            ))}
          </div>
        )}
      </ContentCard>

      {/* Information Card */}
      <ContentCard style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} />
          Document Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: '#64748b' }}>
          <div>
            <strong>Supported Formats:</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <div>📄 PDF Documents</div>
              <div>📝 Word Documents</div>
              <div>🖼️ Images (JPG, PNG)</div>
              <div>📊 Excel Files</div>
            </div>
          </div>
          <div>
            <strong>Document Types:</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <div>• Death Certificate</div>
              <div>• Identification</div>
              <div>• Medical Reports</div>
              <div>• Burial Permits</div>
              <div>• Other Legal Docs</div>
            </div>
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  );
};

export default DocumentsPage;