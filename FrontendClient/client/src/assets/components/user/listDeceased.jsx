import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  PlusCircle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Users,
  Microscope,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Calendar
} from 'lucide-react';

// --- BOLD, HIGH-CONTRAST Color Palette (Version 4: Updated Status/Refresh Colors) ---
const Colors = {
  // Base Colors
  primaryDark: '#2C3E50',      
  accentBlue: '#05668D',       
  white: '#FFFFFF',
  lightGray: '#F7F9FB',        
  mediumGray: '#E9ECEF',       
  darkGray: '#495057',         
  
  // Status Colors - BOLD and DISTINCT
  successGreen: '#1DB954',     
  dangerRed: '#C0392B', // Used for Refresh Button and main Danger color        
  
  // Distinct Colors for Kin/Autopsy Ticks
  kinSuccess: '#00A896',       
  kinDanger: '#E71D36',        
  autopsySuccess: '#6A0572',   
  autopsyDanger: '#FF9F1C',    
  
  warningYellow: '#F39C12',
  infoBlue: '#3498DB',
  tableBorder: '#E9ECEF',
  headerBg: '#34495E',
  hoverGray: '#F0F3F5',

  // Updated Status Pill Colors based on new workflow: Received, underCare, Ready, Completed
  statusReceived: '#6A0572',      // Deep Purple for start status
  statusUnderCare: '#F39C12',     // Warning Yellow for in-progress
  statusReady: '#1DB954',         // Accent Blue for ready state
  statusCompleted: '#C0392B',     // Danger Red (as requested for the refresh button, now used for completed)
};

// --- Keyframe Animations ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Shared Styled Components ---
const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${Colors.lightGray};
  padding: 1.5rem 0rem;
  font-family: 'Inter', sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ContentWrapper = styled.div`
  max-width: 1300px;
  width: 95%;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${Colors.primaryDark};
  letter-spacing: -0.05em;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${Colors.accentBlue};
    font-size: 2.5rem;
  }
`;

const PrimaryButton = styled.button`
  ${({ refresh }) => refresh && css`
    /* *** REFRESH BUTTON FIXED TO REDISH COLOR *** */
    background-color: ${Colors.dangerRed};
    box-shadow: 0 2px 5px rgba(192, 57, 43, 0.2);
    &:hover {
      background-color: #A93226;
      box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
    }
  `}
  ${({ primary }) => primary && css`
    background-color: ${Colors.accentBlue};
    box-shadow: 0 2px 5px rgba(5, 102, 141, 0.2);
    &:hover {
      background-color: #04597b;
      box-shadow: 0 4px 8px rgba(5, 102, 141, 0.3);
    }
  `}

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  border-radius: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);

  &:hover {
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  svg {
    margin-right: 0.6rem;
    font-size: 1.25rem;
  }
`;

const StyledCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); 
  border: 1px solid ${Colors.tableBorder};
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background-color: ${Colors.white};
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: ${Colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  svg {
    color: ${Colors.accentBlue};
    font-size: 1.1rem;
  }
`;

const InputStyle = css`
  padding: 0.75rem 1rem;
  border: 1px solid ${Colors.mediumGray};
  border-radius: 0.4rem;
  font-size: 0.9rem;
  color: ${Colors.darkGray};
  transition: all 0.3s ease-in-out;
  background-color: ${Colors.white};

  &:focus {
    outline: none;
    border-color: ${Colors.accentBlue};
    box-shadow: 0 0 0 3px rgba(5, 102, 141, 0.15);
  }
`;

const YearFilterInput = styled.div`
  position: relative;
  min-width: 150px;
  max-width: 200px;
  
  input {
    ${InputStyle}
    width: 100%;
    padding-right: 0.75rem;
  }

  .year-select-container {
    position: relative;
    display: flex;
  }

  select {
    ${InputStyle}
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
    appearance: none;
  }
`;

const SearchInput = styled(YearFilterInput)`
    min-width: 250px;
    input {
      padding: 0.75rem 1rem 0.75rem 2.5rem;
    }
    svg {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      transform: translateY(-50%);
      color: ${Colors.darkGray};
      font-size: 1.25rem;
      z-index: 5;
    }
`;

const FilterSelect = styled.select`
  ${InputStyle}
  padding-right: 2.5rem;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead th {
    background-color: ${Colors.headerBg};
    color: ${Colors.white};
    padding: 1rem 1.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    border-bottom: 2px solid ${Colors.accentBlue};

    &:first-child { border-top-left-radius: 0.8rem; }
    &:last-child { border-top-right-radius: 0.8rem; }
    &.text-center { text-align: center; }
  }

  tbody tr {
    background-color: ${Colors.white};
    transition: all 0.2s ease-in-out;
    border-bottom: 1px solid ${Colors.tableBorder};

    &:hover {
      background-color: ${Colors.hoverGray};
    }

    td {
      padding: 1rem 1.5rem;
      color: ${Colors.darkGray};
      font-size: 0.9rem;
      font-weight: 500;
      vertical-align: middle;
    }
  }
`;

// Status Icon for Kin/Autopsy Checkmarks (kept for visual separation)
const StatusIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  margin: auto;

  background-color: ${(props) => {
    const statusColor = props.status === 'success' 
      ? (props.type === 'kin' ? Colors.kinSuccess : props.type === 'autopsy' ? Colors.autopsySuccess : Colors.successGreen)
      : (props.type === 'kin' ? Colors.kinDanger : props.type === 'autopsy' ? Colors.autopsyDanger : Colors.dangerRed);
    
    return `${statusColor}1A`; 
  }};

  svg {
    color: ${(props) => {
      return props.status === 'success' 
        ? (props.type === 'kin' ? Colors.kinSuccess : props.type === 'autopsy' ? Colors.autopsySuccess : Colors.successGreen)
        : (props.type === 'kin' ? Colors.kinDanger : props.type === 'autopsy' ? Colors.autopsyDanger : Colors.dangerRed);
    }};
    font-size: 1.3rem;
    font-weight: 900;
  }
`;

// StatusPill Component for direct status text - UPDATED LOGIC
const StatusPill = styled.span`
  display: inline-flex;
  padding: 0.4rem 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  white-space: nowrap;

  ${({ status }) => {
    let bgColor, textColor;
    
    // --- UPDATED STATUS MAPPING ---
    switch (status ? status.toLowerCase() : '') {
      case 'received':
      case 'new':
        bgColor = Colors.statusReceived;
        textColor = Colors.white;
        break;
      case 'undercare':
      case 'pending':
      case 'inprogress':
        bgColor = Colors.statusUnderCare;
        textColor = Colors.darkGray; 
        break;
      case 'ready':
      case 'awaitingcollection':
        bgColor = Colors.statusReady;
        textColor = Colors.white;
        break;
      case 'completed':
      case 'released':
      case 'discharged':
        bgColor = Colors.statusCompleted;
        textColor = Colors.white;
        break;
      default:
        bgColor = Colors.mediumGray;
        textColor = Colors.darkGray;
    }

    return css`
      background-color: ${bgColor};
      color: ${textColor};
    `;
  }}
`;

// --- Status Summary Component ---
const StatusSummary = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${Colors.darkGray};
    margin-right: 1rem; 

    & > div {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.8rem;
        border-radius: 0.4rem;
        background-color: ${Colors.hoverGray};
        border: 1px solid ${Colors.mediumGray};
    }

    span.count {
        font-weight: 700;
        color: ${Colors.primaryDark};
    }
`;

const AnimatedLoader2 = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const ViewDetailsButton = styled(PrimaryButton)`
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  border-radius: 0.4rem;
  background-color: ${Colors.infoBlue};
  box-shadow: 0 1px 5px rgba(52, 152, 219, 0.15);

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(52, 152, 219, 0.25);
  }

  svg {
    margin-right: 0.4rem;
    font-size: 1rem;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: ${Colors.warningYellow}20;
  border-left: 4px solid ${Colors.warningYellow};
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  color: ${Colors.darkGray};
  font-weight: 500;
  animation: ${fadeIn} 0.5s ease-out;
  white-space: nowrap;
  font-size: 0.85rem;

  svg {
    color: ${Colors.warningYellow};
    font-size: 1.2rem;
  }
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 1.5rem;
  color: ${Colors.darkGray};
`;

const Paginator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${Colors.tableBorder};
  flex-wrap: wrap; 
  gap: 1rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  background-color: ${(props) => (props.active ? Colors.accentBlue : Colors.white)};
  color: ${(props) => (props.active ? Colors.white : Colors.darkGray)};
  border: 1px solid ${(props) => (props.active ? Colors.accentBlue : Colors.mediumGray)};
  border-radius: 0.3rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: ${Colors.accentBlue}20;
    color: ${Colors.accentBlue};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// --- Utility Functions ---
const extractYear = (dateString) => {
    if (!dateString) return null;
    try {
        const year = new Date(dateString).getFullYear().toString();
        return year === 'NaN' ? null : year;
    } catch (e) {
        return null;
    }
};


// --- Main Deceased List Component ---
const AllDeceasedPage = () => {
  const navigate = useNavigate();
  // Records are now expected to have 'has_kin' (0 or 1) and 'has_autopsy' (0 or 1)
  const [allDeceasedRecords, setAllDeceasedRecords] = useState([]); 
  const [filteredDeceasedRecords, setFilteredDeceasedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [kinFilter, setKinFilter] = useState('all');
  const [autopsyFilter, setAutopsyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Memoized list of unique years for the filter dropdown
  const uniqueYears = useMemo(() => {
    const years = allDeceasedRecords
      .map(record => extractYear(record.created_at))
      .filter(year => year !== null)
    
    return [...new Set(years)].sort((a, b) => b - a);
  }, [allDeceasedRecords]);

  // Memoized Status Count Calculation - UPDATED LOGIC
  const statusCounts = useMemo(() => {
    const counts = {
      received: 0,
      underCare: 0, // New status count
      ready: 0,     // New status count
      completed: 0, // Uses the old 'released' count
      other: 0,
      total: allDeceasedRecords.length,
    };

    allDeceasedRecords.forEach(record => {
      // Use 'status' field from your API response, which acts as 'current_status'
      const status = (record.status || '').toLowerCase(); 
      
      if (status.includes('received') || status.includes('new')) {
        counts.received++;
      } else if (status.includes('undercare') || status.includes('pending') || status.includes('inprogress')) {
        counts.underCare++;
      } else if (status.includes('ready') || status.includes('awaitingcollection')) {
        counts.ready++;
      } else if (status.includes('completed') || status.includes('released') || status.includes('discharged')) {
        counts.completed++;
      } else {
        counts.other++;
      }
    });

    return counts;
  }, [allDeceasedRecords]);


  useEffect(() => {
    const fetchDeceased = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- API INTEGRATION ---
        const response = await fetch('http://localhost:5000/api/v1/restpoint/deceased-all');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const records = result.data; // Assuming API returns { data: [...] }

        if (Array.isArray(records)) {
          // Normalize the status field name for consistency with old component logic
          const normalizedRecords = records.map(record => ({
            ...record,
            current_status: record.status // Use 'status' from API as 'current_status'
          }));

          setAllDeceasedRecords(normalizedRecords);
          setFilteredDeceasedRecords(normalizedRecords);
        } else {
          setError(result.message || 'No deceased records found or unexpected response format.');
          setAllDeceasedRecords([]);
          setFilteredDeceasedRecords([]);
        }
        
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching deceased records:', err);
        setError('Failed to load deceased records. Please ensure the backend is running and accessible at http://localhost:5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeceased();
  }, []);

  // Filtering Logic - CORRECTED KIN FILTER LOGIC (no change needed here as it was already fixed)
  useEffect(() => {
    let currentFiltered = allDeceasedRecords;

    // 1. Search Term Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (record) =>
          (record.full_name && record.full_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (record.admission_number &&
            record.admission_number.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // 2. Next of Kin Filter - USING 'has_kin' field (0 or 1)
    if (kinFilter === 'hasKin') {
      currentFiltered = currentFiltered.filter((record) => record.has_kin === 1);
    } else if (kinFilter === 'noKin') {
      currentFiltered = currentFiltered.filter((record) => record.has_kin === 0);
    }

    // 3. Autopsy Filter
    if (autopsyFilter === 'performed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === 1);
    } else if (autopsyFilter === 'notPerformed') {
      currentFiltered = currentFiltered.filter((record) => record.has_autopsy === 0);
    }

    // 4. Year Filter
    if (yearFilter !== 'all' && yearFilter.length === 4 && /^\d+$/.test(yearFilter)) {
        currentFiltered = currentFiltered.filter((record) => {
            const recordYear = extractYear(record.created_at);
            return recordYear === yearFilter;
        });
    }

    setFilteredDeceasedRecords(currentFiltered);
    setCurrentPage(1);
  }, [searchTerm, kinFilter, autopsyFilter, yearFilter, allDeceasedRecords]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredDeceasedRecords.length / itemsPerPage);
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredDeceasedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleNewRegistrationClick = () => {
    navigate('/register-deceased');
  };

  const handleViewDetailsClick = (deceasedId) => {
    navigate(`/deceased-details/${deceasedId}`);
  };
  
  // Custom year input handler
  const handleYearChange = (value) => {
    if (value === 'all' || (value.length <= 4 && /^\d*$/.test(value))) {
      setYearFilter(value);
    }
  };


  // Logic to determine which page numbers to show
  const pageNumbers = [];
  const maxPageNumbers = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <AppContainer>
      <ContentWrapper>


        <HeaderSection>
          <Title>
            <ClipboardList /> Deceased Records
          </Title>

          <div style={{ display: "flex", gap: "10px" }}>
           {/* REFRESH BUTTON NOW REDISH */}
           <PrimaryButton 
              onClick={() => window.location.reload()} 
              refresh
            >
              <RefreshCw /> Refresh
            </PrimaryButton>

            <PrimaryButton onClick={handleNewRegistrationClick} primary>
              <PlusCircle /> Register New Deceased
            </PrimaryButton>
          </div>
        </HeaderSection>

   
        <FilterContainer>
          <FilterGroup>
            <FilterLabel htmlFor="search-input">
              <Search /> Search
            </FilterLabel>
            <SearchInput>
              <input
                id="search-input"
                type="text"
                placeholder="Name or admission number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search />
            </SearchInput>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="year-filter">
              <Calendar /> Year
            </FilterLabel>
            <YearFilterInput>
                <div className="year-select-container">
                    <input
                        type="text"
                        placeholder="e.g., 2025"
                        maxLength="4"
                        value={yearFilter === 'all' ? '' : yearFilter}
                        onChange={(e) => handleYearChange(e.target.value)}
                    />
                    <select
                        id="year-filter"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="all">All Years</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </YearFilterInput>
          </FilterGroup>


          <FilterGroup>
            <FilterLabel htmlFor="kin-filter">
              <Users /> Next of Kin
            </FilterLabel>
            <FilterSelect
              id="kin-filter"
              value={kinFilter}
              onChange={(e) => setKinFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="hasKin">Has Next of Kin</option>
              <option value="noKin">No Next of Kin</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="autopsy-filter">
              <Microscope /> Autopsy
            </FilterLabel>
            <FilterSelect
              id="autopsy-filter"
              value={autopsyFilter}
              onChange={(e) => setAutopsyFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="performed">Performed</option>
              <option value="notPerformed">Not Performed</option>
            </FilterSelect>
          </FilterGroup>
        </FilterContainer>

        <StyledCard>
          {loading && (
            <CenteredContainer>
              <AnimatedLoader2 size={60} color={Colors.accentBlue} />
              <p>Fetching data from API...</p>
            </CenteredContainer>
          )}

          {!loading && error && (
            <CenteredContainer>
              <WarningMessage>
                <AlertTriangle size={24} />
                <span>{error}</span>
              </WarningMessage>
              {/* REFRESH BUTTON NOW REDISH */}
              <PrimaryButton onClick={() => window.location.reload()} refresh>
                <RefreshCw /> Try Again
              </PrimaryButton>
            </CenteredContainer>
          )}

          {!loading && !error && filteredDeceasedRecords.length === 0 && (
            <CenteredContainer>
              <p>No deceased records found matching your criteria.</p>
              <PrimaryButton onClick={handleNewRegistrationClick} primary>
                <PlusCircle /> Register First Deceased
              </PrimaryButton>
            </CenteredContainer>
          )}
          
          {!loading && !error && filteredDeceasedRecords.length > 0 && (
            <>
         
              <Paginator>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

                  <StatusSummary>
                    <div>Total: <span className="count">{statusCounts.total}</span></div>
                    <div>Received: <span className="count" style={{color: Colors.statusReceived}}>{statusCounts.received}</span></div>
                    <div>UnderCare: <span className="count" style={{color: Colors.statusUnderCare}}>{statusCounts.underCare}</span></div>
                    <div>Ready: <span className="count" style={{color: Colors.statusReady}}>{statusCounts.ready}</span></div>
                    <div>Completed: <span className="count" style={{color: Colors.statusCompleted}}>{statusCounts.completed}</span></div>
                  </StatusSummary>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Records per page:</span>
                    <FilterSelect value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        {[5, 10, 15, 20, 25, 30, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                        ))}
                    </FilterSelect>
                    <PaginationControls>
                    <PaginationButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft />
                    </PaginationButton>
                    {pageNumbers.map((number) => (
                        <PaginationButton
                        key={number}
                        onClick={() => handlePageChange(number)}
                        active={number === currentPage}
                        >
                        {number}
                        </PaginationButton>
                    ))}
                    <PaginationButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight />
                    </PaginationButton>
                    </PaginationControls>
                </div>
              </Paginator>

              {/* Data Table */}
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Gender</th>
                      <th>Adm-No.</th>
                      <th className="text-center">Next-of-Kin</th>
                      <th className="text-center">Autopsy</th>
                      <th className="text-center">Status</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record) => {
                      // Kin and Autopsy checks remain the same as they were correctly fixed
                      const hasKin = record.has_kin === 1; 
                      const hasAutopsy = record.has_autopsy === 1; 
                      const statusText = record.current_status || 'Unknown'; 

                      return (
                        <tr key={record.deceased_id || record.id}>
                          <td>{record.full_name || 'N/A'}</td>
                          <td>{record.gender || 'N/A'}</td>
                          <td>{record.admission_number || 'N/A'}</td>
                          
                          {/* Next of Kin Status (Deep Teal/Crimson Ticks) */}
                          <td className="text-center">
                            <StatusIcon status={hasKin ? 'success' : 'danger'} type="kin">
                              {hasKin ? <CheckCircle /> : <XCircle />}
                            </StatusIcon>
                          </td>
                          
                          {/* Autopsy Status (Dark Violet/Sunset Orange Ticks) */}
                          <td className="text-center">
                            <StatusIcon status={hasAutopsy ? 'success' : 'danger'} type="autopsy">
                              {hasAutopsy ? <CheckCircle /> : <XCircle />}
                            </StatusIcon>
                          </td>
                          
                       
                          <td className="text-center">
                            <StatusPill status={statusText}>
                              {statusText}
                            </StatusPill>
                          </td>
                          
                          {/* View Details Button */}
                          <td>
                            <ViewDetailsButton onClick={() => handleViewDetailsClick(record.deceased_id || record.id)}>
                              <Eye /> Details
                            </ViewDetailsButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </TableContainer>
            </>
          )}
        </StyledCard>
      </ContentWrapper>
    </AppContainer>
  );
};

export default AllDeceasedPage;