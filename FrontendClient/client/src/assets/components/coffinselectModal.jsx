import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Box, X, Search, Filter, Check, Info, Loader2, AlertCircle, Star, Shield, Truck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- Modern Color Palette ---
const Colors = {
    primary: '#2D3748',
    secondary: '#F7FAFC',
    accent: '#4299E1',
    accentHover: '#3182CE',
    success: '#48BB78',
    warning: '#ED8936',
    danger: '#F56565',
    info: '#0BC5EA',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    textLight: '#A0AEC0',
    border: '#E2E8F0',
    cardBg: '#FFFFFF',
    gradientStart: '#667EEA',
    gradientEnd: '#764BA2',
};

// --- Enhanced Animations ---
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

const slideUp = keyframes`
    from { 
        transform: translateY(100%);
        opacity: 0;
    }
    to { 
        transform: translateY(0);
        opacity: 1;
    }
`;

const scaleIn = keyframes`
    from { 
        transform: scale(0.9);
        opacity: 0;
    }
    to { 
        transform: scale(1);
        opacity: 1;
    }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

const shine = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
`;

// --- Styled Components ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
    background: ${Colors.cardBg};
    border-radius: 24px;
    width: 95vw;
    height: 95vh;
    display: flex;
    flex-direction: column;
    box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: ${scaleIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
`;

const ModalHeader = styled.div`
    background: linear-gradient(135deg, ${Colors.gradientStart} 0%, ${Colors.gradientEnd} 100%);
    color: white;
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
        animation: ${shine} 3s infinite;
    }
`;

const ModalTitle = styled.h2`
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1;
`;

const ModalCloseButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    z-index: 1;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg) scale(1.1);
    }
`;

const ModalContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: ${Colors.secondary};
`;

const SearchSection = styled.div`
    padding: 1.5rem 2rem;
    background: ${Colors.cardBg};
    border-bottom: 1px solid ${Colors.border};
`;

const SearchContainer = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchInput = styled.div`
    flex: 1;
    position: relative;
    
    input {
        width: 100%;
        padding: 1rem 1rem 1rem 3rem;
        border: 2px solid ${Colors.border};
        border-radius: 12px;
        font-size: 1rem;
        background: ${Colors.secondary};
        transition: all 0.3s ease;

        &:focus {
            outline: none;
            border-color: ${Colors.accent};
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
            background: white;
        }

        &::placeholder {
            color: ${Colors.textLight};
        }
    }

    svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: ${Colors.textLight};
    }
`;

const FilterSelect = styled.select`
    padding: 1rem 1.5rem;
    border: 2px solid ${Colors.border};
    border-radius: 12px;
    font-size: 1rem;
    background: ${Colors.secondary};
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;

    &:focus {
        outline: none;
        border-color: ${Colors.accent};
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }
`;

const CoffinsGrid = styled.div`
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    align-content: flex-start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
`;

const CoffinCard = styled.div`
    background: ${Colors.cardBg};
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 3px solid ${props => props.selected ? Colors.success : Colors.border};
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: ${props => props.outOfStock ? 'not-allowed' : 'pointer'};
    display: flex;
    flex-direction: column;
    position: relative;
    animation: ${fadeIn} 0.5s ease-out;

    &:hover {
        transform: ${props => props.outOfStock ? 'none' : 'translateY(-8px) scale(1.02)'};
        box-shadow: ${props => props.outOfStock ? 
            '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 
            '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        };
        border-color: ${props => props.selected ? Colors.success : props.outOfStock ? Colors.border : Colors.accent};
    }

    ${props => props.selected && css`
        background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
        animation: ${pulse} 2s infinite;
    `}

    ${props => props.outOfStock && css`
        opacity: 0.7;
        &::after {
            content: 'OUT OF STOCK';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            background: ${Colors.danger};
            color: white;
            padding: 0.5rem 2rem;
            font-weight: 800;
            font-size: 0.875rem;
            letter-spacing: 2px;
            z-index: 2;
        }
    `}
`;

const CoffinImageContainer = styled.div`
    width: 100%;
    height: 250px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid ${Colors.border};
`;

const CoffinImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.4s ease;

    ${props => !props.outOfStock && css`
        ${CoffinCard}:hover & {
            transform: scale(1.1);
        }
    `}
`;

const ImageFallback = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    color: ${Colors.textLight};
    gap: 0.5rem;
    padding: 1rem;
    text-align: center;
`;

const ImageOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1));
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CardContent = styled.div`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
`;

const CoffinName = styled.h3`
    font-size: 1.3rem;
    font-weight: 700;
    color: ${Colors.textPrimary};
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CoffinDetails = styled.p`
    font-size: 0.9rem;
    color: ${Colors.textSecondary};
    margin: 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    strong {
        color: ${Colors.textPrimary};
        min-width: 80px;
    }
`;

const Price = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${Colors.accent};
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const BadgeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
`;

const Badge = styled.span`
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    color: white;
    background: ${({ type }) => 
        type === 'size' ? Colors.info :
        type === 'premium' ? Colors.warning :
        type === 'local' ? Colors.success : Colors.accent
    };
    display: flex;
    align-items: center;
    gap: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StockStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 1rem;
    background: ${props => 
        props.quantity <= 0 ? '#FED7D7' : 
        props.quantity <= 5 ? '#FEEBC8' : 
        '#C6F6D5'
    };
    color: ${props => 
        props.quantity <= 0 ? '#C53030' : 
        props.quantity <= 5 ? '#DD6B20' : 
        '#276749'
    };
`;

const SelectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: ${Colors.success};
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-weight: 700;
    margin-top: 1rem;
    animation: ${fadeIn} 0.3s ease;
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
`;

const ActionSection = styled.div`
    padding: 1.5rem 2rem;
    background: ${Colors.cardBg};
    border-top: 1px solid ${Colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const ActionButton = styled.button`
    padding: 1.25rem 2.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.primary {
        background: linear-gradient(135deg, ${Colors.accent} 0%, ${Colors.accentHover} 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);

        &:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(66, 153, 225, 0.6);
        }

        &:disabled {
            background: ${Colors.textLight};
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
    }

    &.secondary {
        background: ${Colors.secondary};
        color: ${Colors.textPrimary};
        border: 2px solid ${Colors.border};

        &:hover {
            background: ${Colors.border};
            transform: translateY(-2px);
        }
    }
`;

const LoaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: ${Colors.textSecondary};
    gap: 1.5rem;
`;

const LoaderIcon = styled(Loader2)`
    animation: ${spin} 1s linear infinite;
    color: ${Colors.accent};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: ${Colors.textSecondary};
    text-align: center;
    gap: 1.5rem;
`;

// --- Main Component ---
const CoffinSelectionModal = ({ onClose, onSelectCoffin, deceasedId }) => {
    const [coffins, setCoffins] = useState([]);
    const [filteredCoffins, setFilteredCoffins] = useState([]);
    const [selectedCoffin, setSelectedCoffin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [imageErrors, setImageErrors] = useState(new Set());
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [testingImages, setTestingImages] = useState(new Set());

    // IMPORTANT: Update these URLs to match your backend configuration
    const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';
    const IMAGE_SERVER_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchCoffins = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/all-coffins`);
                const data = response.data;
                
                if (data.success && Array.isArray(data.data)) {
                    setCoffins(data.data);
                    setFilteredCoffins(data.data);
                    console.log('📦 Coffins loaded from API:', data.data);
                    
                    // Test image URLs immediately
                    data.data.forEach(coffin => {
                        const imageUrl = getImageUrl(coffin.image_url);
                        console.log(`🖼️ Coffin ${coffin.coffin_id} image test:`, {
                            originalPath: coffin.image_url,
                            constructedUrl: imageUrl
                        });
                        
                        // Pre-test the image URL
                        testImageUrl(imageUrl, coffin.coffin_id);
                    });
                } else {
                    throw new Error('Invalid data format received from server.');
                }
            } catch (error) {
                console.error("❌ API error:", error);
                toast.error(`Failed to load coffins: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoffins();
    }, []);

    // Function to test if image URL is accessible
    const testImageUrl = async (url, coffinId) => {
        if (!url) return;
        
        setTestingImages(prev => new Set([...prev, coffinId]));
        
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                console.log(`✅ Image accessible for coffin ${coffinId}: ${url}`);
            } else {
                console.log(`❌ Image not found (${response.status}) for coffin ${coffinId}: ${url}`);
            }
        } catch (error) {
            console.log(`❌ Image test failed for coffin ${coffinId}: ${url}`, error.message);
        } finally {
            setTestingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(coffinId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        let filtered = coffins;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(coffin =>
                coffin.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coffin.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coffin.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coffin.color?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply stock filter
        if (filter === 'inStock') {
            filtered = filtered.filter(coffin => coffin.quantity > 0);
        } else if (filter === 'outOfStock') {
            filtered = filtered.filter(coffin => coffin.quantity <= 0);
        }

        setFilteredCoffins(filtered);
    }, [searchTerm, filter, coffins]);

    const handleSelect = (coffin) => {
        if (coffin.quantity <= 0) {
            toast.warn("This coffin is out of stock.", { autoClose: 2000 });
            return;
        }
        setSelectedCoffin(coffin);
    };

    const handleAssignCoffin = async () => {
        if (!selectedCoffin) {
            toast.error('Please select a coffin first');
            return;
        }

        try {
            const assignmentData = {
                deceased_id: deceasedId,
                coffin_id: selectedCoffin.coffin_id,
                assigned_by: 'current-user',
                deceased_name: 'Deceased'
            };

            const response = await axios.post(`${API_BASE_URL}/assign-coffin`, assignmentData);
            
            if (response.data.success) {
                toast.success('✅ Coffin assigned successfully!');
                onSelectCoffin(selectedCoffin);
            } else {
                throw new Error(response.data.message || 'Failed to assign coffin');
            }
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(`❌ Failed to assign coffin: ${error.response?.data?.message || error.message}`);
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Price not set';
        
        try {
            return `KSh ${parseFloat(price).toLocaleString('en-KE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } catch (error) {
            console.error('Error formatting price:', error);
            return `KSh ${price}`;
        }
    };

    /**
     * Constructs the absolute URL for coffin images from API
     */
    const getImageUrl = (imagePath) => {
        // If no image path, return null
        if (!imagePath) {
            console.log('❌ No image path provided');
            return null;
        }
        
        // Check if the path is already a full URL
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            console.log('✅ Already a full URL:', imagePath);
            return imagePath;
        }
        
        // For local paths from API (like "/uploads/coffins/coffin-1759835975379-751940642.jpeg")
        // Construct the full URL using the image server base URL
        let cleanPath = imagePath.trim();
        
        // Ensure the path starts with a slash
        if (!cleanPath.startsWith('/')) {
            cleanPath = `/${cleanPath}`;
        }
        
        // Remove trailing slash from base URL if present
        const baseUrl = IMAGE_SERVER_BASE_URL.replace(/\/$/, '');
        
        // Construct final URL: http://localhost:5000 + /uploads/coffins/coffin-1759835975379-751940642.jpeg
        const finalUrl = `${baseUrl}${cleanPath}`;
        console.log('🖼️ Constructed image URL:', finalUrl);
        return finalUrl;
    };

    const handleImageError = (coffinId, imageUrl) => {
        console.error(`❌ Image failed to load for coffin ${coffinId}:`, imageUrl);
        setImageErrors(prev => new Set([...prev, coffinId]));
    };

    const handleImageLoad = (coffinId, imageUrl) => {
        console.log(`✅ Image loaded successfully for coffin ${coffinId}`);
        setLoadedImages(prev => new Set([...prev, coffinId]));
    };

    const handleClose = (e) => {
        e.stopPropagation();
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Enhanced Image Component with better debugging
    const CoffinImageWithDebug = ({ coffin, imageUrl, isOutOfStock }) => {
        const [imgError, setImgError] = useState(false);
        const [imgLoaded, setImgLoaded] = useState(false);
        const isTesting = testingImages.has(coffin.coffin_id);

        console.log(`🖼️ Rendering image for coffin ${coffin.coffin_id}:`, {
            type: coffin.type,
            material: coffin.material,
            imageUrl: imageUrl,
            hasError: imgError,
            isLoaded: imgLoaded
        });

        return (
            <CoffinImageContainer>
                {imageUrl && !imgError ? (
                    <>
                        <CoffinImage 
                            src={imageUrl} 
                            alt={`${coffin.type} - ${coffin.material}`}
                            outOfStock={isOutOfStock}
                            onError={(e) => {
                                console.error(`🖼️ IMAGE ERROR for coffin ${coffin.coffin_id}:`, {
                                    url: imageUrl,
                                    error: e,
                                    coffinType: coffin.type,
                                    coffinMaterial: coffin.material
                                });
                                setImgError(true);
                                handleImageError(coffin.coffin_id, imageUrl);
                            }}
                            onLoad={() => {
                                console.log(`🖼️ IMAGE LOADED for coffin ${coffin.coffin_id}:`, {
                                    type: coffin.type,
                                    material: coffin.material,
                                    url: imageUrl
                                });
                                setImgLoaded(true);
                                handleImageLoad(coffin.coffin_id, imageUrl);
                            }}
                            style={{ 
                                border: imgLoaded ? 'none' : '2px dashed #4299E1',
                                opacity: imgLoaded ? 1 : 0.8 
                            }}
                        />
                        <ImageOverlay />
                        {!imgLoaded && !imgError && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                zIndex: 10
                            }}>
                                {isTesting ? 'Testing URL...' : 'Loading image...'}
                            </div>
                        )}
                    </>
                ) : (
                    <ImageFallback>
                        <Box size={48} />
                        <span>No Image Available</span>
                        <small style={{ fontSize: '10px', marginTop: '8px', textAlign: 'center' }}>
                            {coffin.image_url ? `Path: ${coffin.image_url}` : 'No image path'}
                        </small>
                        {imageUrl && (
                            <div style={{ 
                                fontSize: '10px', 
                                marginTop: '8px',
                                padding: '4px 8px',
                                background: '#F56565',
                                color: 'white',
                                borderRadius: '4px'
                            }}>
                                URL: {imageUrl}
                            </div>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                testImageUrl(imageUrl, coffin.coffin_id);
                            }}
                            disabled={isTesting}
                            style={{
                                marginTop: '8px',
                                padding: '4px 8px',
                                background: isTesting ? '#A0AEC0' : '#4299E1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: isTesting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isTesting ? 'Testing...' : 'Test URL'}
                        </button>
                    </ImageFallback>
                )}
            </CoffinImageContainer>
        );
    };

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <Box size={28} />
                        Select a Coffin - View Images
                    </ModalTitle>
                    <ModalCloseButton onClick={handleClose}>
                        <X size={24} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalContent>
                    <SearchSection>
                        <SearchContainer>
                            <SearchInput>
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search coffins by type, material, size, or color..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </SearchInput>
                            <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">All Coffins</option>
                                <option value="inStock">In Stock</option>
                                <option value="outOfStock">Out of Stock</option>
                            </FilterSelect>
                        </SearchContainer>
                    </SearchSection>

                    {isLoading ? (
                        <LoaderWrapper>
                            <LoaderIcon size={48} />
                            <div>Loading available coffins with images...</div>
                        </LoaderWrapper>
                    ) : filteredCoffins.length > 0 ? (
                        <>
                            <CoffinsGrid>
                                {filteredCoffins.map(coffin => {
                                    const imageUrl = getImageUrl(coffin.image_url);
                                    const hasImageError = imageErrors.has(coffin.coffin_id);
                                    const isOutOfStock = coffin.quantity <= 0;
                                    const imageLoaded = loadedImages.has(coffin.coffin_id);
                                    const isTesting = testingImages.has(coffin.coffin_id);
                                    
                                    console.log(`🎯 Rendering coffin card:`, {
                                        id: coffin.coffin_id,
                                        type: coffin.type,
                                        material: coffin.material,
                                        imageUrl: imageUrl,
                                        hasImage: !!imageUrl
                                    });

                                    return (
                                        <CoffinCard
                                            key={coffin.coffin_id}
                                            selected={selectedCoffin?.coffin_id === coffin.coffin_id}
                                            outOfStock={isOutOfStock}
                                            onClick={() => handleSelect(coffin)}
                                        >
                                            {/* COFFIN IMAGE AT THE TOP - PROMINENTLY DISPLAYED */}
                                            <CoffinImageWithDebug 
                                                coffin={coffin}
                                                imageUrl={imageUrl}
                                                isOutOfStock={isOutOfStock}
                                            />

                                            {/* COFFIN DETAILS BELOW THE IMAGE */}
                                            <CardContent>
                                                <CoffinName>
                                                    <Shield size={18} />
                                                    {coffin.type || 'Unnamed Coffin'}
                                                    {imageLoaded && (
                                                        <span style={{ 
                                                            fontSize: '10px', 
                                                            background: '#48BB78', 
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            marginLeft: '8px'
                                                        }}>
                                                            ✅
                                                        </span>
                                                    )}
                                                    {isTesting && (
                                                        <span style={{ 
                                                            fontSize: '10px', 
                                                            background: '#ED8936', 
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            marginLeft: '8px'
                                                        }}>
                                                            Testing...
                                                        </span>
                                                    )}
                                                </CoffinName>
                                                
                                                <CoffinDetails>
                                                    <strong>Material:</strong> 
                                                    <span>{coffin.material || 'Not specified'}</span>
                                                </CoffinDetails>
                                                <CoffinDetails>
                                                    <strong>Color:</strong> 
                                                    <span>{coffin.color || 'Not specified'}</span>
                                                </CoffinDetails>
                                                <CoffinDetails>
                                                    <strong>Size:</strong> 
                                                    <span>{coffin.size || 'Not specified'}</span>
                                                </CoffinDetails>
                                                <CoffinDetails>
                                                    <strong>Supplier:</strong> 
                                                    <Truck size={14} />
                                                    <span>{coffin.supplier || 'Not specified'}</span>
                                                </CoffinDetails>
                                                
                                                <Price>
                                                    <Star size={20} fill="currentColor" />
                                                    {formatPrice(coffin.exact_price)}
                                                </Price>
                                                
                                                <BadgeContainer>
                                                    <Badge type="size">
                                                        {coffin.size || 'Standard'}
                                                    </Badge>
                                                    {coffin.origin === 'local' && (
                                                        <Badge type="local">
                                                            Local
                                                        </Badge>
                                                    )}
                                                    {parseFloat(coffin.exact_price) > 50000 && (
                                                        <Badge type="premium">
                                                            Premium
                                                        </Badge>
                                                    )}
                                                </BadgeContainer>
                                                
                                                <StockStatus quantity={coffin.quantity}>
                                                    {coffin.quantity <= 0 ? (
                                                        <>
                                                            <AlertCircle size={16} />
                                                            Out of Stock
                                                        </>
                                                    ) : coffin.quantity <= 5 ? (
                                                        <>
                                                            <AlertCircle size={16} />
                                                            Low Stock: {coffin.quantity} left
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check size={16} />
                                                            In Stock: {coffin.quantity} available
                                                        </>
                                                    )}
                                                </StockStatus>

                                                {selectedCoffin?.coffin_id === coffin.coffin_id && (
                                                    <SelectionBadge>
                                                        <Check size={18} />
                                                        Selected
                                                    </SelectionBadge>
                                                )}
                                            </CardContent>
                                        </CoffinCard>
                                    );
                                })}
                            </CoffinsGrid>

                            <ActionSection>
                                <div>
                                    {selectedCoffin && (
                                        <div style={{ 
                                            color: Colors.textPrimary, 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '10px',
                                            border: `2px solid ${Colors.success}`
                                        }}>
                                            ✅ <strong>Selected:</strong> {selectedCoffin.type} - {selectedCoffin.material} - {selectedCoffin.size}
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <ActionButton className="secondary" onClick={handleClose}>
                                        <X size={20} />
                                        Cancel
                                    </ActionButton>
                                    <ActionButton 
                                        className="primary" 
                                        onClick={handleAssignCoffin}
                                        disabled={!selectedCoffin}
                                    >
                                        <Check size={20} />
                                        Assign Coffin
                                    </ActionButton>
                                </div>
                            </ActionSection>
                        </>
                    ) : (
                        <EmptyState>
                            <Info size={64} />
                            <div>
                                <h3 style={{ color: Colors.textPrimary, marginBottom: '0.5rem' }}>
                                    No Coffins Found
                                </h3>
                                <p>
                                    {searchTerm || filter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'No coffins available in inventory'
                                    }
                                </p>
                            </div>
                        </EmptyState>
                    )}
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default CoffinSelectionModal;