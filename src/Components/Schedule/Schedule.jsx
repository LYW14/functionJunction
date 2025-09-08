import React, { useState, useEffect, useCallback } from 'react';
import './Schedule.css';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reservationExpiry, setReservationExpiry] = useState(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const GOOGLE_FORM_URL = 'https://forms.gle/YK6LysRUMQkx7UfM7';

  const availableTimeRanges = {
    Monday: ['10:00', '13:00'],
    Tuesday: ['16:00', '18:00'],
    Wednesday: ['09:00', '15:00'],
    Thursday: ['14:00', '18:00'],
    Friday: ['11:30', '17:00'],
  };

  // Polling interval for checking slot availability
  const [pollingInterval, setPollingInterval] = useState(null);

  // Start polling when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Initial fetch
      fetchBookedSlots(selectedDate);
      
      // Set up polling every 5 seconds
      const interval = setInterval(() => {
        fetchBookedSlots(selectedDate);
      }, 5000);
      
      setPollingInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [selectedDate]);

  // Fetch booked slots for selected date
  const fetchBookedSlots = useCallback(async (date) => {
    if (!date) return;
    
    try {
      const response = await fetch(`${API_BASE}/appointments/${date}`);
      const data = await response.json();
      
      if (response.ok) {
        setBookedSlots(data.bookedSlots || []);
      } else {
        console.error('Failed to fetch booked slots:', data.error);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  }, [API_BASE]);

  // Reserve slots temporarily
  const reserveSlots = async (slots) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          timeSlots: slots,
          sessionId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setReservationExpiry(data.reservedUntil);
        return true;
      } else {
        if (data.error.includes('already reserved')) {
          alert(`Slot "${data.conflictSlot}" is currently reserved by another user. Please try a different time slot.`);
          // Refresh the booked slots to get the latest state
          fetchBookedSlots(selectedDate);
        } else {
          alert(data.error || 'Failed to reserve slots');
        }
        // Refresh booked slots to get latest state
        fetchBookedSlots(selectedDate);
        return false;
      }
    } catch (error) {
      console.error('Error reserving slots:', error);
      alert('Network error. Please try again.');
      return false;
    }
  };

  // Book appointment permanently
  const bookAppointment = async (clientInfo = {}) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          timeSlots: selectedSlots,
          clientInfo,
          sessionId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSelectedSlots([]);
        setShowForm(false);
        setReservationExpiry(null);
        alert('Your appointment has been booked successfully!');
        // Refresh the booked slots
        fetchBookedSlots(selectedDate);
        return true;
      } else {
        if (data.error.includes('expired')) {
          alert('Your reservation has expired. Please select slots again.');
          setSelectedSlots([]);
          setShowForm(false);
          setReservationExpiry(null);
          fetchBookedSlots(selectedDate);
        } else {
          alert(data.error || 'Failed to book appointment');
        }
        return false;
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateString) => {
    // Fix timezone issue by using the date string directly
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (current < endTime) {
      const next = new Date(current.getTime() + 30 * 60000);
      const label = `${current.toTimeString().slice(0, 5)} - ${next.toTimeString().slice(0, 5)}`;
      slots.push(label);
      current = next;
    }
    return slots;
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedSlots([]);
    setShowForm(false);
    setReservationExpiry(null);
  };

  const handleSlotClick = async (slot, index, allSlots) => {
    if (loading) return;

    const isAlreadySelected = selectedSlots.includes(slot);

    if (isAlreadySelected) {
      const updated = selectedSlots.filter((s) => s !== slot);
      setSelectedSlots(updated);
      
      if (updated.length === 0) {
        setShowForm(false);
        setReservationExpiry(null);
      } else {
        // Re-reserve remaining slots
        const success = await reserveSlots(updated);
        if (!success) {
          setSelectedSlots([]);
          setShowForm(false);
          setReservationExpiry(null);
        }
      }
      return;
    }

    if (selectedSlots.length === 2) return; // max 2 slots

    let newSelectedSlots;

    if (selectedSlots.length === 1) {
      const existingIndex = allSlots.indexOf(selectedSlots[0]);
      if (Math.abs(existingIndex - index) === 1) {
        newSelectedSlots = [...selectedSlots, slot];
      } else {
        // Not adjacent, replace selection
        newSelectedSlots = [slot];
      }
    } else {
      newSelectedSlots = [slot];
    }

    // Reserve the slots
    const success = await reserveSlots(newSelectedSlots);
    if (success) {
      setSelectedSlots(newSelectedSlots);
      setShowForm(true);
    }
  };

  const handleFormSubmit = () => {
    bookAppointment();
  };

  // Countdown timer for reservation
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!reservationExpiry) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = reservationExpiry - now;
      
      if (remaining <= 0) {
        setTimeLeft(null);
        setSelectedSlots([]);
        setShowForm(false);
        setReservationExpiry(null);
        alert('Your reservation has expired. Please select slots again.');
        fetchBookedSlots(selectedDate);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationExpiry, selectedDate]);

  const formatTimeLeft = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderSlots = () => {
    if (!selectedDate) return <p>Please select a date.</p>;

    const dayName = getDayName(selectedDate);
    const range = availableTimeRanges[dayName];

    if (!range) return <p>No availability on {dayName}s.</p>;

    const allSlots = generateTimeSlots(range[0], range[1]);

    return (
      <div className="slots">
        {loading && <div className="loading-indicator">Loading availability...</div>}
        {allSlots.map((slot, index) => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedSlots.includes(slot);
          
          return (
            <button
              key={slot}
              className={`slot ${
                isBooked
                  ? 'booked'
                  : isSelected
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleSlotClick(slot, index, allSlots)}
              disabled={isBooked || loading}
            >
              <div className="slot-time">{slot}</div>
              {isBooked && <span className="slot-status booked-label">Unavailable</span>}
              {isSelected && <span className="slot-status selected-label">Selected</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="schedule">
      <h2>Book an Appointment</h2>
      <p className="schedule-description">
        Select a date and choose your preferred time slots. You can select up to 2 consecutive slots.
      </p>
      
      <div className="date-picker-container">
        <label htmlFor="date-picker" className="date-label">Choose a date:</label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>

      {renderSlots()}

      {timeLeft && (
        <div className="reservation-timer">
          <span className="timer-icon">⏰</span>
          <span>Slots reserved for: <strong>{formatTimeLeft(timeLeft)}</strong></span>
          <div className="timer-bar">
            <div 
              className="timer-progress" 
              style={{
                width: `${Math.max(0, (timeLeft / (10 * 60 * 1000)) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>Complete Your Booking</h3>
            <div className="selected-info">
              <span className="selected-date">📅 {selectedDate}</span>
              <span className="selected-times">⏰ {selectedSlots.join(', ')}</span>
            </div>
          </div>
          
          <div className="form-content">
            <p>Please fill out the form to complete your appointment booking:</p>
            
            <div className="form-button-container">
              <button 
                className="open-form-btn"
                onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
              >
                📋 Open Booking Form
              </button>
              <p className="form-instruction">
                The form will open in a new tab. After submitting it, return here and click "I've Submitted the Form" below.
              </p>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              className="confirm-btn primary-btn" 
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Booking...
                </>
              ) : (
                "✓ I've Submitted the Form"
              )}
            </button>
            <button 
              className="cancel-btn secondary-btn" 
              onClick={() => {
                setSelectedSlots([]);
                setShowForm(false);
                setReservationExpiry(null);
              }}
              disabled={loading}
            >
              Cancel Selection
            </button>
          </div>
        </div>
      )}

      <div className="schedule-info">
        <h4>How it works:</h4>
        <ol>
          <li>Select a date from the calendar</li>
          <li>Choose 1-2 consecutive time slots</li>
          <li>Fill out the booking form</li>
          <li>Confirm your appointment</li>
        </ol>
      </div>
    </div>
  );
};

export default Schedule;