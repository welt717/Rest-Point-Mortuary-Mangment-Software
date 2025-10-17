// components/DocumentSummary.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FileText, Eye } from 'lucide-react';


const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  border: 1px solid #CBD5E1;
  color: #334155;
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

const DocumentCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #F0F9FF;
  border-radius: 0.5rem;
  border: 1px solid #BAE6FD;
`;

const CountNumber = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0369A1;
`;

const CountLabel = styled.span`
  color: #0C4A6E;
  font-weight: 500;
`;

const ShowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background-color: #3B82F6;
  color: white;
  transition: background-color 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #2563EB;
  }
`;

const DocumentSummary = ({ deceasedId, deceasedName, onShowDocuments }) => {
  const [documentCount, setDocumentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentCount = async () => {
      if (!deceasedId) return;
      
      try {
        const response = await apiService.getDocuments(deceasedId);
        setDocumentCount(response.data.data?.length || 0);
      } catch (error) {
        console.error('Error fetching document count:', error);
        setDocumentCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentCount();
  }, [deceasedId]);

  if (isLoading) {
    return (
      <Card>
        <CardTitle>
          <FileText size={20} />
          Documents
        </CardTitle>
        <div>Loading...</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>
        <FileText size={20} />
        Documents
      </CardTitle>
      
      <DocumentCount>
        <CountNumber>{documentCount}</CountNumber>
        <CountLabel>document{documentCount !== 1 ? 's' : ''} uploaded</CountLabel>
      </DocumentCount>
      
      {documentCount > 0 && (
        <ShowButton onClick={onShowDocuments}>
          <Eye size={16} />
          View Documents
        </ShowButton>
      )}
    </Card>
  );
};

export default DocumentSummary;