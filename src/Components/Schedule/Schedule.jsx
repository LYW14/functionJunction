import React, { useState } from 'react';
import './Schedule.css';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const GOOGLE_FORM_URL = 'https://forms.gle/YnExbiYEvnbksdKt7'; 

  const availableTimeRanges = {
    Monday: ['10:00', '13:00'],
    Tuesday: ['16:00', '18:00'],
    Wednesday: ['09:00', '15:00'],
    Thursday: ['14:00', '18:00'],
    Friday: ['11:30', '17:00'],
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlots([]);
    setShowForm(false);
  };

  const handleSlotClick = (slot, index, allSlots) => {
    const isAlreadySelected = selectedSlots.includes(slot);

    if (isAlreadySelected) {
      const updated = selectedSlots.filter((s) => s !== slot);
      setSelectedSlots(updated);
      setShowForm(updated.length > 0); // show form if at least 1 slot remains
      return;
    }

    if (selectedSlots.length === 2) return; // max 2 slots

    if (selectedSlots.length === 1) {
      const existingIndex = allSlots.indexOf(selectedSlots[0]);
      if (Math.abs(existingIndex - index) === 1) {
        setSelectedSlots([...selectedSlots, slot]);
        setShowForm(true);
      }
      // Not adjacent? Do nothing.
    } else {
      setSelectedSlots([slot]);
      setShowForm(true);
    }
  };

  const handleFormSubmit = () => {
    if (!selectedDate) return;

    setBookedSlots((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), ...selectedSlots],
    }));

    setSelectedSlots([]);
    setShowForm(false);
    alert('Your session has been booked!');
  };

  const renderSlots = () => {
    if (!selectedDate) return <p>Please select a date.</p>;

    const dayName = getDayName(selectedDate);
    const range = availableTimeRanges[dayName];

    if (!range) return <p>No availability on {dayName}s.</p>;

    const allSlots = generateTimeSlots(range[0], range[1]);
    const booked = bookedSlots[selectedDate] || [];

    return (
      <div className="slots">
        {allSlots.map((slot, index) => (
          <button
            key={slot}
            className={`slot ${
              booked.includes(slot)
                ? 'booked'
                : selectedSlots.includes(slot)
                ? 'selected'
                : ''
            }`}
            onClick={() => handleSlotClick(slot, index, allSlots)}
            disabled={booked.includes(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="schedule">
      <h2>Book an Appointment</h2>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="date-picker"
      />

      {renderSlots()}

      {showForm && (
        <div className="form-section">
          <h3>Almost there!</h3>
          <p>Finish booking by filling out the form below:</p>
          <iframe
            title="Google Form"
            src={GOOGLE_FORM_URL}
            width="100%"
            height="600"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          >
            Loading…
          </iframe>
          <button className="confirm-btn" onClick={handleFormSubmit}>
            I've Submitted the Form
          </button>
        </div>
      )}
    </div>
  );
};

export default Schedule;
