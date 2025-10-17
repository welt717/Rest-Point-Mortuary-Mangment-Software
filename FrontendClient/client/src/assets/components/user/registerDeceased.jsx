import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserPlus, Check, Loader2, ClipboardList, AlertTriangle, XCircle, CheckCircle, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Configuration ---
const API_ENDPOINT = 'http://localhost:5000/api/v1/restpoint/register-deceased';

const NotificationToast = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification.isVisible) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, isVisible: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification.isVisible) return null;

    const icons = {
        success: <CheckCircle className="me-2" size={20} />,
        error: <XCircle className="me-2" size={20} />,
        info: <Info className="me-2" size={20} />,
        alert: <AlertTriangle className="me-2" size={20} />,
    };

    const styles = {
        success: 'alert-success border-success text-success',
        error: 'alert-danger border-danger text-danger',
        info: 'alert-info border-info text-info',
        alert: 'alert-warning border-warning text-warning',
    };

    const iconStyle = notification.icon || 'info';

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div
                className={`alert d-flex align-items-start shadow-lg fade show ${styles[iconStyle]}`}
                role="alert"
            >
                {icons[iconStyle]}
                <div>
                    <strong className="d-block mb-1">{notification.title}</strong>
                    <small>{notification.message}</small>
                </div>
                <button
                    type="button"
                    className="btn-close ms-auto"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                    onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}
                ></button>
            </div>
        </div>
    );
};

// --- Enhanced Custom Calendar Component ---
const CustomCalendar = ({ selectedDate, onChange, maxDate = new Date(), placeholder = "Select Date", fieldErrors = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const [view, setView] = useState('days');
    const calendarRef = useRef(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();

    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const generateDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex);
        
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonthIndex, i);
            date.setHours(0, 0, 0, 0);
            days.push(date);
        }
        
        return days;
    };

    const handleDateSelect = (date) => {
        if (date) {
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            
            if (selectedDate <= maxDate) {
                onChange(selectedDate);
                setIsOpen(false);
                setView('days');
            }
        }
    };

    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(currentYear, monthIndex, 1);
        setCurrentMonth(newDate);
        setView('days');
    };

    const handleYearSelect = (year) => {
        const newDate = new Date(year, currentMonthIndex, 1);
        setCurrentMonth(newDate);
        setView('months');
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentYear, currentMonthIndex + direction, 1);
        setCurrentMonth(newDate);
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const isDateDisabled = (date) => {
        if (!date) return true;
        return date > maxDate;
    };

    const formatDateDisplay = (date) => {
        if (!date) return placeholder;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
                setView('days');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [selectedDate]);

    const handleInputClick = (e) => {
        e.stopPropagation();
        setIsOpen(true);
    };

    const handleCalendarButtonClick = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const canNavigateNext = view === 'days' && 
        (currentYear < maxDate.getFullYear() || 
         (currentYear === maxDate.getFullYear() && currentMonthIndex < maxDate.getMonth()));

    return (
        <div className="custom-calendar-wrapper position-relative" ref={calendarRef}>
            <div className="input-group">
                <input
                    type="text"
                    className={`form-control rounded-2 p-2 ${fieldErrors ? 'is-invalid' : ''}`}
                    value={formatDateDisplay(selectedDate)}
                    readOnly
                    placeholder={placeholder}
                    onClick={handleInputClick}
                    style={{ cursor: 'pointer' }}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={handleCalendarButtonClick}
                >
                    <Calendar size={18} />
                </button>
            </div>

            {isOpen && (
                <div 
                    className="custom-calendar-popup position-absolute top-100 start-0 mt-1 shadow-lg border rounded-3 bg-white p-3"
                    style={{ 
                        zIndex: 1060, 
                        minWidth: '300px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="calendar-header d-flex justify-content-between align-items-center mb-3">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigateMonth(-1)}
                            disabled={view !== 'days'}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setView(view === 'months' ? 'days' : 'months')}
                            >
                                {months[currentMonthIndex]}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setView(view === 'years' ? 'days' : 'years')}
                            >
                                {currentYear}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigateMonth(1)}
                            disabled={!canNavigateNext}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {view === 'days' && (
                        <>
                            <div className="calendar-weekdays d-grid text-center mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="small text-muted fw-bold p-1">{day}</div>
                                ))}
                            </div>
                            <div className="calendar-days d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {generateDays().map((date, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`btn btn-sm p-1 ${!date ? 'invisible' : ''} ${
                                            date && isSameDay(date, selectedDate) 
                                                ? 'btn-primary text-white' 
                                                : isDateDisabled(date)
                                                    ? 'btn-outline-secondary text-muted' 
                                                    : 'btn-outline-secondary'
                                        }`}
                                        disabled={isDateDisabled(date)}
                                        onClick={() => handleDateSelect(date)}
                                        style={{ 
                                            height: '36px',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {date ? date.getDate() : ''}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {view === 'months' && (
                        <div className="calendar-months d-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {months.map((month, index) => (
                                <button
                                    key={month}
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleMonthSelect(index)}
                                >
                                    {month.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}

                    {view === 'years' && (
                        <div className="calendar-years" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {years.map(year => (
                                    <button
                                        key={year}
                                        type="button"
                                        className={`btn btn-sm ${
                                            year === currentYear ? 'btn-primary' : 'btn-outline-secondary'
                                        }`}
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="calendar-footer mt-3 pt-2 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                {selectedDate ? `Selected: ${formatDateDisplay(selectedDate)}` : 'No date selected'}
                            </small>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleDateSelect(today)}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setView('days');
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-calendar-wrapper {
                    z-index: 1000;
                }
                .custom-calendar-popup {
                    width: 100%;
                    max-width: 320px;
                    z-index: 1060;
                }
                .calendar-days .btn,
                .calendar-months .btn,
                .calendar-years .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .calendar-days .btn:hover:not(:disabled) {
                    transform: scale(1.05);
                }
                .calendar-weekdays div {
                    font-size: 0.75rem;
                }
                .calendar-years {
                    scrollbar-width: thin;
                }
                .calendar-years::-webkit-scrollbar {
                    width: 6px;
                }
                .calendar-years::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .calendar-years::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }
                .calendar-years::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>
        </div>
    );
};

// --- Utility Functions ---
const getRegisteredByUsername = () => {
    try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            return user.username || user.name || user.id || 'System User';
        }
    } catch (e) {
        console.warn("Could not parse user info from localStorage:", e);
    }
    return 'Unknown User';
};

const parseDateString = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const [year, month, day] = dateString.split('-');
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
        }
        date.setHours(0, 0, 0, 0);
        return date;
    } catch (error) {
        console.warn('Error parsing date:', dateString, error);
        return null;
    }
};

const formatDateToISO = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.warn('Error formatting date:', date, error);
        return '';
    }
};

// Create separate component for each input type to prevent re-renders
const TextInput = React.memo(({ name, value, onChange, errors, label, type = "text", required = true, ...props }) => {
    return (
        <div className="mb-3 w-100">
            <label htmlFor={name} className="form-label text-capitalize fw-semibold">
                {label || name.replace(/_/g, ' ')} {required && <span className="text-danger">*</span>}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                value={value || ''}
                onChange={onChange}
                className={`form-control ${errors[name] ? 'is-invalid' : ''} rounded-2 p-2`}
                required={required}
                {...props}
            />
            {errors[name] && (
                <div className="invalid-feedback d-flex align-items-center">
                    <AlertTriangle size={14} className="me-1" />{errors[name]}
                </div>
            )}
        </div>
    );
});

const SelectInput = React.memo(({ name, value, onChange, errors, label, options, required = true, ...props }) => {
    return (
        <div className="mb-3 w-100">
            <label htmlFor={name} className="form-label text-capitalize fw-semibold">
                {label || name.replace(/_/g, ' ')} {required && <span className="text-danger">*</span>}
            </label>
            <select
                name={name}
                id={name}
                value={value || ''}
                onChange={onChange}
                className={`form-select ${errors[name] ? 'is-invalid' : ''} rounded-2 p-2`}
                required={required}
                {...props}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors[name] && (
                <div className="invalid-feedback d-flex align-items-center">
                    <AlertTriangle size={14} className="me-1" />{errors[name]}
                </div>
            )}
        </div>
    );
});

const DateFieldInput = React.memo(({ name, value, onChange, errors, label, required = true }) => {
    const dateObject = parseDateString(value);
    const hasError = errors[name];

    return (
        <div className="mb-3 w-100">
            <label htmlFor={name} className="form-label text-capitalize fw-semibold">
                {label || name.replace(/_/g, ' ')} {required && <span className="text-danger">*</span>}
            </label>
            <CustomCalendar
                selectedDate={dateObject}
                onChange={(date) => onChange(date, name)}
                maxDate={new Date()}
                placeholder={`Select ${label || name.replace(/_/g, ' ')}`}
                fieldErrors={hasError}
            />
            {hasError && (
                <div className="text-danger small d-flex align-items-center mt-1">
                    <AlertTriangle size={12} className="me-1" />
                    {errors[name]}
                </div>
            )}
        </div>
    );
});

// --- Main Component ---
const DeceasedRegistrationForm = () => {
    useEffect(() => {
        loadBootstrapCSS();
    }, []);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const registeredBy = getRegisteredByUsername();

    const initialFormData = useMemo(() => ({
        full_name: '', national_id: '', gender: '', date_of_birth: '',
        date_of_death: '', place_of_death: '', cause_of_death: '',
        admission_number: '', date_admitted: '', county: '', location: '',
    }), []);

    const [formData, setFormData] = useState(initialFormData);
    const [notification, setNotification] = useState({
        isVisible: false, icon: 'info', title: '', message: '',
    });

    // Stable handler for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Stable handler for date changes
    const handleDateChange = (date, name) => {
        const isoString = formatDateToISO(date);
        setFormData(prev => ({ 
            ...prev, 
            [name]: isoString 
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const allFormFields = useMemo(() => Object.keys(initialFormData), [initialFormData]);

    const validateForm = () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        allFormFields.forEach(key => {
            const value = formData[key];
            const isRequired = key !== 'admission_number' && key !== 'date_admitted'; 

            if (isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                newErrors[key] = `${fieldName} is required.`;
            }

            if (key.includes('date_') && value) {
                const dateValue = parseDateString(value);
                if (dateValue && dateValue > today) {
                    newErrors[key] = `Date cannot be in the future.`;
                }
            }
        });

        if (formData.date_of_birth && formData.date_of_death) {
            const birthDate = parseDateString(formData.date_of_birth);
            const deathDate = parseDateString(formData.date_of_death);
            
            if (birthDate && deathDate && birthDate >= deathDate) {
                newErrors.date_of_death = "Date of Death must be after Date of Birth.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setNotification({
                isVisible: true, 
                icon: 'error', 
                title: 'Validation Error 🛑',
                message: 'Please fill in all required fields correctly before submitting.',
            });
            return;
        }

        setLoading(true);
        try {
            const payload = { 
                ...formData, 
                registered_by: registeredBy 
            };

            console.log('Submitting payload:', payload);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setNotification({
                    isVisible: true, 
                    icon: 'success', 
                    title: 'Success! 🎉',
                    message: result.message || 'Deceased record registered successfully!',
                });
                setFormData(initialFormData); 
                setErrors({});
            } else {
                setNotification({
                    isVisible: true, 
                    icon: 'error', 
                    title: 'Registration Failed 😟',
                    message: result.message || `Server error: ${response.status} ${response.statusText}.`,
                });
            }
        } catch (error) {
            console.error('Error registering deceased:', error);
            setNotification({
                isVisible: true, 
                icon: 'error', 
                title: 'Network Error 🔌',
                message: 'Could not connect to the server. Check if http://localhost:5000 is running.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center p-3 p-sm-5" style={{fontFamily: 'Inter, sans-serif'}}>
            <NotificationToast notification={notification} setNotification={setNotification} />
            <div className="col-lg-8 col-xl-7 w-100">
                <h1 className="fs-1 fw-bolder text-dark text-center mb-5 letter-spacing-1">
                    Deceased Registration Form <span className="text-danger">📝</span>
                </h1>

                <div className="card shadow-lg p-3 p-sm-5 border-0 rounded-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-4 p-3 bg-light rounded border border-secondary-subtle">
                                <p className="fw-bold text-dark mb-1">Registered By:</p>
                                <p className="font-monospace text-danger-emphasis text-break">{registeredBy}</p>
                            </div>

                            <div className="col-12">
                                <h2 className="fs-4 fw-bold text-dark mb-4 pb-2 border-bottom d-flex align-items-center">
                                    <UserPlus size={24} className="me-2 text-danger" /> 1. Patient Identity Details
                                </h2>
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="full_name" 
                                    value={formData.full_name} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="Full Name" 
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="national_id" 
                                    value={formData.national_id} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="National ID" 
                                />
                            </div>
                            <div className="col-md-6">
                                <SelectInput
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    errors={errors}
                                    label="Gender"
                                    options={[
                                        { value: '', label: 'Select Gender', disabled: true },
                                        { value: 'Male', label: 'Male' },
                                        { value: 'Female', label: 'Female' },
                                        { value: 'Other', label: 'Other' },
                                    ]}
                                />
                            </div>
                            <div className="col-md-6">
                                <DateFieldInput 
                                    name="date_of_birth" 
                                    value={formData.date_of_birth} 
                                    onChange={handleDateChange} 
                                    errors={errors} 
                                    label="Date of Birth" 
                                />
                            </div>

                            <div className="col-12 mt-4">
                                <h2 className="fs-4 fw-bold text-dark mb-4 pb-2 border-bottom d-flex align-items-center">
                                    <ClipboardList size={24} className="me-2 text-danger" /> 2. Death and Location Details
                                </h2>
                            </div>
                            <div className="col-md-6">
                                <DateFieldInput 
                                    name="date_of_death" 
                                    value={formData.date_of_death} 
                                    onChange={handleDateChange} 
                                    errors={errors} 
                                    label="Date of Death" 
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="place_of_death" 
                                    value={formData.place_of_death} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="Place of Death (Hospital, Home, etc.)" 
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="cause_of_death" 
                                    value={formData.cause_of_death} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="Cause of Death" 
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="admission_number" 
                                    value={formData.admission_number} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="Admission Number" 
                                    required={false} 
                                />
                            </div>
                            <div className="col-md-6">
                                <DateFieldInput 
                                    name="date_admitted" 
                                    value={formData.date_admitted} 
                                    onChange={handleDateChange} 
                                    errors={errors} 
                                    label="Date Admitted" 
                                    required={false} 
                                />
                            </div>

                            <div className="col-12 mt-4">
                                <h3 className="fs-5 fw-semibold text-secondary mb-3">Geographic Location</h3>
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="county" 
                                    value={formData.county} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="County / Region" 
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    errors={errors} 
                                    label="Location / Sub-county" 
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-center mt-5 pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-danger btn-lg rounded-3 py-2 px-5 fw-bold d-flex align-items-center justify-content-center shadow-lg"
                                style={{ minWidth: '200px' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin me-2" size={24} />
                                        Sending Request...
                                    </>
                                ) : (
                                    <>
                                        <Check size={24} className="me-2" /> Register Deceased Record
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper function to load Bootstrap CSS
const loadBootstrapCSS = () => {
    if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(link);
    }
};

export default DeceasedRegistrationForm;