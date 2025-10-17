import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Box, CheckSquare, PlusSquare, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the new modal component
import CoffinSelectionModal from '../coffinselectModal';

const Card = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
`;

const CardTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: #1A237E;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #CFD8DC;
    padding-bottom: 0.75rem;
`;

const AssignmentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
`;

const AssignedCoffinDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #E3F2FD;
    border: 1px solid #90CAF9;
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    color: #1A237E;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background-color: #42A5F5;
    color: white;
    transition: background-color 0.3s ease, transform 0.2s ease;
    &:hover {
        background-color: #1E88E5;
        transform: translateY(-2px);
    }
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
`;

const NoData = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    color: #78909C;
    padding: 2rem;
`;

const CoffinAssignment = () => {
    const { id } = useParams();
    const [deceasedData, setDeceasedData] = useState(null);
    const [coffinData, setCoffinData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

    const fetchDeceasedData = async () => {
        setIsLoading(true);
        const url = `${API_BASE_URL}/deceased-id?id=${id}`;
        try {
            const response = await axios.get(url);
            
            if (response.data && response.data.data) {
                setDeceasedData(response.data.data);
                
                // If coffin is assigned, fetch coffin details
                if (response.data.data.coffin_id) {
                    fetchCoffinDetails(response.data.data.coffin_id);
                } else {
                    setIsLoading(false);
                }
            } else {
                setDeceasedData(null);
                toast.error("Deceased person not found.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("API error:", error.response || error);
            setDeceasedData(null);
            toast.error("Failed to fetch deceased data. Please check the ID.");
            setIsLoading(false);
        }
    };

    const fetchCoffinDetails = async (coffinId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/coffin/${coffinId}`);
            if (response.data && response.data.data) {
                setCoffinData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching coffin details:", error);
            toast.error("Failed to fetch coffin details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDeceasedData();
        } else {
            toast.error("No deceased ID provided in URL parameters.");
            setIsLoading(false);
        }
    }, [id]);

    const handleCoffinAssigned = () => {
        // Refetch data to get updated coffin information
        fetchDeceasedData();
        setIsModalOpen(false);
    };

    return (
        <div>
            <Card>
                <CardTitle><Box /> Coffin Assignment</CardTitle>
                {isLoading ? (
                    <LoaderWrapper>
                        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#42A5F5' }} />
                    </LoaderWrapper>
                ) : !deceasedData ? (
                    <NoData>
                        <Info size={24} /> Deceased person not found.
                    </NoData>
                ) : (
                    <AssignmentWrapper>
                        {deceasedData.coffin_id ? (
                            <AssignedCoffinDisplay>
                                <CheckSquare size={24} color="#4CAF50" />
                                <div>
                                    <div><strong>Coffin Assigned</strong></div>
                                    {coffinData ? (
                                        <div>
                                            Type: {coffinData.type}, 
                                            Size: {coffinData.size}, 
                                            Material: {coffinData.material}
                                        </div>
                                    ) : (
                                        <div>Coffin ID: {deceasedData.coffin_id}</div>
                                    )}
                                </div>
                            </AssignedCoffinDisplay>
                        ) : (
                            <>
                                <span>No coffin has been assigned yet.</span>
                                <Button onClick={() => setIsModalOpen(true)}>
                                    <PlusSquare size={20} /> Select a Coffin
                                </Button>
                            </>
                        )}
                    </AssignmentWrapper>
                )}
            </Card>

            {isModalOpen && deceasedData && (
                <CoffinSelectionModal
                    onClose={() => setIsModalOpen(false)}
                    onSelectCoffin={handleCoffinAssigned}
                    deceasedId={id}
                />
            )}

            <ToastContainer />
        </div>
    );
};

export default CoffinAssignment;