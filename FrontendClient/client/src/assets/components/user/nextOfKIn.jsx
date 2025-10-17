import React, { useState } from 'react';
import styled from 'styled-components';
import { Users, SquareUser, Handshake, Phone, MapPin, PlusCircle, Trash2, X, Loader2, CheckCircle, Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';

// Enhanced Professional Color Palette
const Colors = {
    cardBg: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textValue: '#374151',
    borderColor: '#E5E7EB',
    shadow: '0 8px 24px rgba(0,0,0,0.06)',

    accentBlue: '#2563EB',
    accentBlueLight: '#E0E7FF',
    dangerRed: '#EF4444',
    dangerRedHover: '#DC2626',
    claimedRed: '#B91C1C', 
    buttonBg: '#2563EB',
    buttonHover: '#1D4ED8',
};

// --- Styled Components (Retained) ---

const KinContainer = styled.div`
    background-color: ${Colors.cardBg};
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: ${Colors.shadow};
    border: 1px solid ${Colors.borderColor};
    color: ${Colors.textPrimary};
    font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const Title = styled.h4`
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: ${Colors.textPrimary};

    svg {
        color: ${Colors.accentBlue};
    }
`;

const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background-color: ${Colors.buttonBg};
    color: white;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: ${Colors.buttonHover};
    }
`;

const KinList = styled.div`
    display: grid;
    gap: 1rem;
`;

const KinCard = styled.div`
    padding: 1.2rem;
    border: 1px solid ${Colors.borderColor};
    border-radius: 0.5rem;
    position: relative;
    background-color: #F9FAFB;
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transform: translateY(-2px);
    }
`;

const DataRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;

    svg {
        color: ${Colors.accentBlue};
        flex-shrink: 0;
    }

    strong {
        min-width: 100px;
        font-weight: 600;
        color: ${Colors.textSecondary};
    }

    span {
        color: ${Colors.textValue};
        word-break: break-word;
    }
`;

const StyledBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    
    background-color: ${props => props.type === 'claimed' ? Colors.claimedRed : Colors.accentBlueLight};
    color: ${props => props.type === 'claimed' ? 'white' : Colors.accentBlue};

    svg {
        color: ${props => props.type === 'claimed' ? 'white' : Colors.accentBlue};
    }
`;

const BadgeGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const DeleteButton = styled.button`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: ${Colors.dangerRed};
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: ${Colors.dangerRedHover};
    }
`;

const NoKin = styled.p`
    color: ${Colors.textSecondary};
    text-align: center;
    padding: 1rem;
    font-style: italic;
`;

// Modal component (Retained)
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <h4>{title}</h4>
                    <ModalCloseButton onClick={onClose}><X size={20} /></ModalCloseButton>
                </ModalHeader>
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${Colors.cardBg};
    padding: 1.5rem;
    border-radius: 0.75rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: ${Colors.shadow};
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${Colors.borderColor};
    padding-bottom: 1rem;
    margin-bottom: 1rem;

    h4 {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
        color: ${Colors.textPrimary};
    }
`;

const ModalCloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${Colors.textSecondary};
    transition: color 0.2s ease;

    &:hover {
        color: ${Colors.dangerRed};
    }
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-weight: 600;
    font-size: 0.9rem;
`;

const Input = styled.input`
    padding: 0.75rem;
    border: 1px solid ${Colors.borderColor};
    border-radius: 0.5rem;
    font-size: 1rem;
    color: ${Colors.textPrimary};
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${Colors.accentBlue};
    }
`;

const OptionalText = styled.span`
    font-size: 0.8rem;
    color: ${Colors.textSecondary};
    font-style: italic;
`;

// Main Component
const NextOfKinSection = ({ nextOfKin, onUpdate }) => {
    // Get the deceased ID from the URL parameters
    const { id: deceasedId } = useParams();

    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [fullName, setFullName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');

    // API URLs
    const API_REGISTER_KIN_URL = 'http://localhost:5000/api/v1/restpoint/register/kin';
    const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint'; 

    const resetForm = () => {
        setFullName('');
        setRelationship('');
        setContact('');
        setEmail('');
    };

    const handleDelete = async (kinId) => {
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/deceased/${deceasedId}/next-of-kin/${kinId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete next of kin');
            }
            onUpdate(); 
            setMessage('Next of kin removed successfully');
        } catch (error) {
            console.error('Error deleting next of kin:', error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleAddKin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // 1. Construct the Dynamic Payload
        const payload = {
            deceased_id: deceasedId, 
            full_name: fullName,
            relationship: relationship,
            contact: contact,
            // Handle optional email: send null if the string is empty
            email: email.trim() === '' ? null : email, 
        };

        console.log('Sending payload:', payload); 

        if (!payload.deceased_id || !payload.full_name || !payload.relationship || !payload.contact) {
            setIsLoading(false);
            setMessage('Error: Missing required fields (Deceased ID, Name, Relationship, Contact).');
            return;
        }

        try {
            // 2. Send Data to the Backend
            const response = await fetch(API_REGISTER_KIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // 3. Handle Response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            setMessage(result.message || 'Next of kin added successfully! 👍');
            setShowModal(false);
            resetForm();
            onUpdate(); // Refresh parent component's data
        } catch (error) {
            console.error('Error adding next of kin:', error);
            setMessage(`Error: ${error.message} ⚠️`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KinContainer>
            {/* Header: Displays Title and "Add Kin" button (Always visible) */}
            <Header>
                <Title><Users /> Next of Kin</Title>
                <StyledButton onClick={() => {
                    setShowModal(true);
                    resetForm();
                }}>
                    <PlusCircle size={18} /> Add Kin
                </StyledButton>
            </Header>

            {/* Conditional Rendering of Kin List */}
            {nextOfKin?.length > 0 ? (
                <KinList>
                    {/* Maps and displays each Next of Kin */}
                    {nextOfKin.map(kin => (
                        <KinCard key={kin.id}> 
                            <DeleteButton onClick={() => handleDelete(kin.id)}> 
                                <Trash2 size={16} />
                            </DeleteButton>

                            <DataRow>
                                <SquareUser />
                                <strong>Name:</strong>
                                <span>{kin.full_name}</span>
                            </DataRow>
                            <DataRow>
                                <Handshake />
                                <strong>Relationship:</strong>
                                <span>{kin.relationship}</span>
                            </DataRow>
                            <DataRow>
                                <Phone />
                                <strong>Contact:</strong>
                                <span>{kin.contact}</span>
                            </DataRow>
                            {kin.email && (
                                <DataRow>
                                    <Mail />
                                    <strong>Email:</strong>
                                    <span>{kin.email}</span>
                                </DataRow>
                            )}
                            {/* Assuming 'address' might be in the future data model */}
                            {kin.address && (
                                <DataRow>
                                    <MapPin />
                                    <strong>Address:</strong>
                                    <span>{kin.address}</span>
                                </DataRow>
                            )}

                            <BadgeGroup>
                                <StyledBadge>{kin.relationship}</StyledBadge>
                                {kin.is_claimed && (
                                    <StyledBadge type="claimed">
                                        <CheckCircle size={14} /> Body Claimed
                                    </StyledBadge>
                                )}
                            </BadgeGroup>
                        </KinCard>
                    ))}
                </KinList>
            ) : (
                // Displays this message if nextOfKin is empty or null
                <NoKin>No next of kin recorded for deceased ID: {deceasedId}. Click "Add Kin" to register one.</NoKin>
            )}

            {message && (
                <p style={{ marginTop: '1rem', color: message.startsWith('Error') ? Colors.dangerRed : Colors.accentBlue, textAlign: 'center' }}>
                    {message}
                </p>
            )}

            {/* Modal for adding Kin (Room to add another kin) */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title="Add Next of Kin"
            >
                <Form onSubmit={handleAddKin}>
                    <FormGroup>
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                            id="full_name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="relationship">Relationship *</Label>
                        <Input
                            id="relationship"
                            type="text"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="contact">Contact *</Label>
                        <Input
                            id="contact"
                            type="tel"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="email">
                            Email <OptionalText>(optional)</OptionalText>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                        />
                    </FormGroup>

                    <StyledButton type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        {isLoading ? 'Adding...' : 'Add Kin'}
                    </StyledButton>
                </Form>
            </Modal>
        </KinContainer>
    );
};

export default NextOfKinSection;