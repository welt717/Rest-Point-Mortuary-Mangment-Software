import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Truck, Briefcase, UserCheck, Phone,
    Calendar, Clock, Clipboard, BookText, PlusCircle, X, Loader2, CheckCircle, MapPin, DollarSign, Car, Users
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// New, professional color palette
const Colors = {
    cardBg: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textValue: '#374151',
    borderColor: '#E5E7EB',
    shadow: '0 8px 24px rgba(0,0,0,0.06)',

    // Vibrant, professional accent colors
    accentBlue: '#2563EB',
    dangerRed: '#EF4444',
    dangerRedHover: '#DC2626',
    buttonBg: '#2563EB',
    buttonHover: '#1D4ED8',

    // Progress bar colors
    progressBg: '#E0E7FF',
    progressBar: '#4C60E2',
};

// --- Styled Components ---

const DispatchContainer = styled.div`
    background-color: ${Colors.cardBg};
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: ${Colors.shadow};
    border: 1px solid ${Colors.borderColor};
    color: ${Colors.textPrimary};
    font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
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
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background-color: ${Colors.buttonBg};
    color: white;
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
        background-color: ${Colors.buttonHover};
        transform: translateY(-2px);
    }
`;

const DataGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
`;

const DataRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;

    svg {
        color: ${Colors.accentBlue};
        flex-shrink: 0;
        margin-top: 0.15rem;
    }

    strong {
        min-width: 120px;
        font-weight: 600;
        color: ${Colors.textSecondary};
    }

    span {
        color: ${Colors.textValue};
    }
`;

const NoDispatch = styled.p`
    color: ${Colors.textSecondary};
    text-align: center;
    padding: 3rem 1rem;
    font-size: 1.1rem;
    font-style: italic;
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-weight: 600;
    font-size: 0.9rem;
    color: ${Colors.textPrimary};
`;

const Input = styled.input`
    padding: 0.75rem;
    border: 1px solid ${Colors.borderColor};
    border-radius: 0.5rem;
    font-size: 1rem;
    color: ${Colors.textPrimary};
    transition: border-color 0.2s ease;
    background-color: #f9fafb;

    &:focus {
        outline: none;
        border-color: ${Colors.accentBlue};
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;

const Select = styled.select`
    padding: 0.75rem;
    border: 1px solid ${Colors.borderColor};
    border-radius: 0.5rem;
    font-size: 1rem;
    color: ${Colors.textPrimary};
    transition: border-color 0.2s ease;
    background-color: #f9fafb;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.25rem;

    &:focus {
        outline: none;
        border-color: ${Colors.accentBlue};
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;

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
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${Colors.cardBg};
    padding: 2rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 900px; /* Made modal bigger */
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const ModalHeader = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${Colors.borderColor};
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;

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

const ProgressBarContainer = styled.div`
    height: 8px;
    background-color: ${Colors.progressBg};
    border-radius: 4px;
    margin-top: 1rem;
    overflow: hidden;
`;

const ProgressBar = styled.div.attrs(props => ({
    style: {
        width: `${props.progress}%`
    }
}))`
    height: 100%;
    background-color: ${Colors.progressBar};
    border-radius: 4px;
    transition: width 0.5s ease-in-out;
`;

const StatusIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: ${props => props.isReady ? Colors.progressBar : Colors.textSecondary};
    margin-top: 1rem;
`;

const MapContainerWrapper = styled.div`
    height: 300px;
    width: 100%;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 1px solid ${Colors.borderColor};
`;

const FormColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

// New constants for car types and pricing
const CAR_TYPES = [
    { value: 'sedan', label: 'Sedan', baseCost: 1500, seats: 4 },
    { value: 'suv', label: 'SUV', baseCost: 2500, seats: 6 },
    { value: 'van', label: 'Van', baseCost: 3500, seats: 12 },
    { value: 'hearse', label: 'Hearse', baseCost: 5000, seats: 2 },
];

// New function to calculate distance using the Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Earth's radius in kilometers
    const R = 6371;

    // Convert degrees to radians
    const toRadians = (deg) => deg * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in km

    return distance;
};

// Hardcoded origin for the mortuary (e.g., City Mortuary, Nairobi)
// This is the default 'current location' for this app's purpose.
const MORTUARY_ORIGIN = {
    lat: -1.2954,
    lon: 36.8175,
};

const DispatchSection = ({ dispatch, onUpdate }) => {
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [status, setStatus] = useState('Assigned');
    const [notes, setNotes] = useState('');
    const [dispatchDate, setDispatchDate] = useState('');
    const [dispatchTime, setDispatchTime] = useState('');
    const [assignedBy, setAssignedBy] = useState('id_20');

    // New state for location, using city name and calculated coordinates
    const [destinationCity, setDestinationCity] = useState('');
    const [destinationLat, setDestinationLat] = useState(null);
    const [destinationLon, setDestinationLon] = useState(null);
    const [distance, setDistance] = useState(null);

    // New state for user-defined rate, car type, cost, and number of seats
    const [ratePerKm, setRatePerKm] = useState(50); // Default rate in KES
    const [carType, setCarType] = useState('sedan');
    const [cost, setCost] = useState(null);
    const [numSeats, setNumSeats] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';
    const OPENCAGE_API_KEY = 'be430f830f61463984d43796ab0c8f10'; // Replace with your key

    const resetForm = () => {
        setVehiclePlate('');
        setDriverName('');
        setDriverContact('');
        setStatus('Assigned');
        setNotes('');
        setDispatchDate('');
        setDispatchTime('');
        setDestinationCity('');
        setDestinationLat(null);
        setDestinationLon(null);
        setDistance(null);
        setCarType('sedan');
        setCost(null);
        setNumSeats(null);
        setRatePerKm(50); // Reset to default rate
    };

    useEffect(() => {
        if (showModal && dispatch) {
            setVehiclePlate(dispatch.vehicle_plate || '');
            setDriverName(dispatch.driver_name || '');
            setDriverContact(dispatch.driver_contact || '');
            setStatus(dispatch.status || 'Assigned');
            setNotes(dispatch.notes || '');
            setDestinationCity(dispatch.destination_city || '');
            setDestinationLat(dispatch.destination_lat || null);
            setDestinationLon(dispatch.destination_lon || null);
            setDistance(dispatch.distance_km || null);
            setCarType(dispatch.car_type || 'sedan');
            setCost(dispatch.cost || null);
            setNumSeats(dispatch.num_seats || null);
            
            // Set ratePerKm from existing dispatch if it exists, otherwise use default
            setRatePerKm(dispatch.rate_per_km || 50);

            if (dispatch.dispatch_date) {
                const date = new Date(dispatch.dispatch_date);
                setDispatchDate(date.toISOString().substring(0, 10));
            } else {
                setDispatchDate('');
            }
            setDispatchTime(dispatch.dispatch_time || '');
        }
    }, [showModal, dispatch, id]);

    // UseEffect to fetch coordinates when city changes
    useEffect(() => {
        const fetchCoordinates = async () => {
            if (destinationCity.length > 2) {
                setIsLoading(true);
                setMessage('Fetching coordinates for ' + destinationCity + '...');
                try {
                    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destinationCity)}&key=${OPENCAGE_API_KEY}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        const { lat, lng } = data.results[0].geometry;
                        setDestinationLat(lat);
                        setDestinationLon(lng);
                        setMessage('Location found.');
                    } else {
                        setDestinationLat(null);
                        setDestinationLon(null);
                        setMessage('Could not find location for ' + destinationCity + '.');
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                    setMessage('Error fetching location data.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setDestinationLat(null);
                setDestinationLon(null);
                setMessage('');
            }
        };

        const debounceTimer = setTimeout(fetchCoordinates, 500);
        return () => clearTimeout(debounceTimer);
    }, [destinationCity, OPENCAGE_API_KEY]);

    // UseEffect to calculate distance and cost whenever coordinates, car type, or rate change
    useEffect(() => {
        if (destinationLat !== null && destinationLon !== null) {
            const calculatedDist = calculateDistance(
                MORTUARY_ORIGIN.lat,
                MORTUARY_ORIGIN.lon,
                destinationLat,
                destinationLon
            );
            const distInKm = calculatedDist.toFixed(2);
            setDistance(distInKm);

            const selectedCar = CAR_TYPES.find(car => car.value === carType);
            if (selectedCar) {
                // Correct calculation: Base cost + (user-defined rate * distance)
                const calculatedCost = selectedCar.baseCost + (ratePerKm * distInKm);
                setCost(calculatedCost.toFixed(2));
                setNumSeats(selectedCar.seats);
            }
        } else {
            setDistance(null);
            setCost(null);
            setNumSeats(null);
        }
    }, [destinationLat, destinationLon, carType, ratePerKm]);


    const handleDispatch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const payload = {
            deceased_id: id,
            vehicle_plate: vehiclePlate,
            driver_name: driverName,
            driver_contact: driverContact,
            status: status,
            notes: notes,
            dispatch_date: dispatchDate,
            dispatch_time: dispatchTime,
            assigned_by: assignedBy,
            destination_city: destinationCity,
            origin_lat: MORTUARY_ORIGIN.lat,
            origin_lon: MORTUARY_ORIGIN.lon,
            destination_lat: destinationLat,
            destination_lon: destinationLon,
            distance_km: distance,
            car_type: carType,
            num_seats: numSeats,
            rate_per_km: ratePerKm, // Include the user-defined rate
            cost: cost,
        };

        let url;
        let method;

        if (dispatch) {
            url = `${API_BASE_URL}/dispatch/${dispatch.id}`;
            method = 'PUT';
        } else {
            url = `${API_BASE_URL}/dispatch`;
            method = 'POST';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${dispatch ? 'update' : 'assign'} dispatch`);
            }

            const result = await response.json();
            setMessage(result.message || `Dispatch ${dispatch ? 'updated' : 'assigned'} successfully!`);
            setShowModal(false);
            resetForm();
            onUpdate();
        } catch (error) {
            console.error(`Error ${dispatch ? 'updating' : 'assigning'} dispatch:`, error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateProgress = () => {
        if (!dispatch) return 0;
        const fields = [
            dispatch.vehicle_plate,
            dispatch.driver_name,
            dispatch.driver_contact,
            dispatch.dispatch_date,
            dispatch.dispatch_time,
            dispatch.destination_city,
            dispatch.distance_km,
            dispatch.cost,
            dispatch.car_type,
            dispatch.num_seats,
        ];
        const filledCount = fields.filter(field => field && field.length > 0).length;
        return (filledCount / fields.length) * 100;
    };

    const progress = calculateProgress();
    const isReady = dispatch?.dispatch_date && dispatch?.dispatch_time && dispatch?.distance_km;

    return (
        <DispatchContainer>
            <Header>
                <Title>
                    <Truck /> Vehicle Dispatch
                    {isReady && (
                        <StatusIndicator isReady>
                            <CheckCircle size={20} /> Ready
                        </StatusIndicator>
                    )}
                </Title>
                <StyledButton onClick={() => setShowModal(true)}>
                    <PlusCircle size={18} /> {dispatch ? 'Edit Dispatch' : 'Assign Dispatch'}
                </StyledButton>
            </Header>

            <ProgressBarContainer>
                <ProgressBar progress={progress} />
            </ProgressBarContainer>

            {dispatch?.vehicle_plate ? (
                <DataGrid>
                    <DataRow>
                        <Briefcase />
                        <strong>Vehicle Plate:</strong>
                        <span>{dispatch.vehicle_plate}</span>
                    </DataRow>
                    <DataRow>
                        <UserCheck />
                        <strong>Driver Name:</strong>
                        <span>{dispatch.driver_name}</span>
                    </DataRow>
                    <DataRow>
                        <Phone />
                        <strong>Driver Contact:</strong>
                        <span>{dispatch.driver_contact}</span>
                    </DataRow>
                    <DataRow>
                        <Car />
                        <strong>Car Type:</strong>
                        <span>{dispatch.car_type ? dispatch.car_type.charAt(0).toUpperCase() + dispatch.car_type.slice(1) : 'N/A'}</span>
                    </DataRow>
                    <DataRow>
                        <Users />
                        <strong>Number of Seats:</strong>
                        <span>{dispatch.num_seats || 'N/A'}</span>
                    </DataRow>
                    <DataRow>
                        <MapPin />
                        <strong>Destination:</strong>
                        <span>{dispatch.destination_city || 'N/A'}</span>
                    </DataRow>
                    {dispatch.distance_km && (
                        <DataRow>
                            <MapPin />
                            <strong>Distance:</strong>
                            <span>{dispatch.distance_km} km</span>
                        </DataRow>
                    )}
                    {dispatch.cost && (
                        <DataRow>
                            <DollarSign />
                            <strong>Cost:</strong>
                            <span>KES {dispatch.cost}</span>
                        </DataRow>
                    )}
                    <DataRow>
                        <Calendar />
                        <strong>Dispatch Date:</strong>
                        <span>
                            {dispatch.dispatch_date && !isNaN(new Date(dispatch.dispatch_date))
                                ? new Date(dispatch.dispatch_date).toLocaleDateString()
                                : 'N/A'}
                        </span>
                    </DataRow>
                    <DataRow>
                        <Clock />
                        <strong>Dispatch Time:</strong>
                        <span>{dispatch.dispatch_time || 'N/A'}</span>
                    </DataRow>
                    <DataRow>
                        <Clipboard />
                        <strong>Status:</strong>
                        <span>{dispatch.status || 'N/A'}</span>
                    </DataRow>
                    <DataRow>
                        <BookText />
                        <strong>Notes:</strong>
                        <span>{dispatch.notes || 'N/A'}</span>
                    </DataRow>
                </DataGrid>
            ) : (
                <NoDispatch>No dispatch information available.</NoDispatch>
            )}

            {message && (
                <p style={{ marginTop: '1rem', textAlign: 'center', color: message.startsWith('Error') ? Colors.dangerRed : Colors.accentBlue }}>
                    {message}
                </p>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={dispatch ? 'Edit Dispatch' : 'Assign Dispatch'}
            >
                <FormColumn>
                    <FormGroup>
                        <Label htmlFor="vehicle_plate">Vehicle Plate</Label>
                        <Input
                            id="vehicle_plate"
                            type="text"
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="driver_name">Driver Name</Label>
                        <Input
                            id="driver_name"
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="driver_contact">Driver Contact</Label>
                        <Input
                            id="driver_contact"
                            type="tel"
                            value={driverContact}
                            onChange={(e) => setDriverContact(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="car_type">Type of Car</Label>
                        <Select
                            id="car_type"
                            value={carType}
                            onChange={(e) => setCarType(e.target.value)}
                            required
                        >
                            {CAR_TYPES.map(car => (
                                <option key={car.value} value={car.value}>
                                    {car.label} ({car.seats} seats)
                                </option>
                            ))}
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="rate_per_km">Cost Per KM (KES)</Label>
                        <Input
                            id="rate_per_km"
                            type="number"
                            value={ratePerKm}
                            onChange={(e) => setRatePerKm(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="destination_city">Destination City</Label>
                        <Input
                            id="destination_city"
                            type="text"
                            value={destinationCity}
                            onChange={(e) => setDestinationCity(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="dispatch_date">Dispatch Date</Label>
                        <Input
                            id="dispatch_date"
                            type="date"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="dispatch_time">Dispatch Time</Label>
                        <Input
                            id="dispatch_time"
                            type="time"
                            value={dispatchTime}
                            onChange={(e) => setDispatchTime(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </FormGroup>
                </FormColumn>
                <FormColumn>
                    <FormGroup>
                        <Label>Calculated Distance & Cost</Label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Input
                                type="text"
                                value={distance !== null ? `${distance} km` : 'Enter city'}
                                disabled
                                style={{ flex: 1 }}
                            />
                            <Input
                                type="text"
                                value={cost !== null ? `KES ${cost}` : 'Calculating...'}
                                disabled
                                style={{ flex: 1 }}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label>Route Map</Label>
                        <MapContainerWrapper>
                            <MapContainer
                                center={[MORTUARY_ORIGIN.lat, MORTUARY_ORIGIN.lon]}
                                zoom={destinationLat && destinationLon ? 8 : 12}
                                scrollWheelZoom={false}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[MORTUARY_ORIGIN.lat, MORTUARY_ORIGIN.lon]}>
                                    <Popup>Mortuary Origin</Popup>
                                </Marker>
                                {destinationLat && destinationLon && (
                                    <Marker position={[destinationLat, destinationLon]}>
                                        <Popup>Destination: {destinationCity}</Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </MapContainerWrapper>
                    </FormGroup>
                    <StyledButton type="submit" onClick={handleDispatch} disabled={isLoading || distance === null}>
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        {isLoading ? 'Saving...' : 'Save Dispatch'}
                    </StyledButton>
                </FormColumn>
            </Modal>
        </DispatchContainer>
    );
};

export default DispatchSection;