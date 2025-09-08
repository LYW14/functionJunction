// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointments');

// Schemas
const appointmentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    index: true
  },
  timeSlots: [{
    type: String,
    required: true
  }],
  clientInfo: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'cancelled', 'completed'],
    default: 'booked'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sessionId: String, // To track which browser session made the booking
});

// Compound index to prevent double booking
appointmentSchema.index({ date: 1, timeSlots: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Temporary slot reservations (in-memory store)
// In production, consider using Redis
const tempReservations = new Map(); // key: "date-slot", value: { sessionId, expiresAt }
const RESERVATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Clean up expired reservations
setInterval(() => {
  const now = Date.now();
  for (const [key, reservation] of tempReservations.entries()) {
    if (now > reservation.expiresAt) {
      tempReservations.delete(key);
      // Notify all clients that this slot is available again
      const [date, slot] = key.split('-');
      io.emit('slotAvailable', { date, slot });
    }
  }
}, 30000); // Check every 30 seconds

// Routes

// Get booked slots for a specific date
app.get('/api/appointments/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const appointments = await Appointment.find({ 
      date,
      status: { $in: ['booked', 'confirmed'] }
    });
    
    const bookedSlots = appointments.flatMap(apt => apt.timeSlots);
    
    // Also include temporarily reserved slots
    const reservedSlots = [];
    const now = Date.now();
    
    for (const [key, reservation] of tempReservations.entries()) {
      if (key.startsWith(`${date}-`) && now < reservation.expiresAt) {
        const slot = key.split('-').slice(1).join('-'); // Handle slots with dashes
        reservedSlots.push(slot);
      }
    }
    
    res.json({
      bookedSlots: [...bookedSlots, ...reservedSlots]
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Reserve slots temporarily
app.post('/api/appointments/reserve', (req, res) => {
  try {
    const { date, timeSlots, sessionId } = req.body;
    
    if (!date || !timeSlots || !Array.isArray(timeSlots) || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const expiresAt = Date.now() + RESERVATION_TIMEOUT;
    const reservedSlots = [];
    
    // Check if slots are already reserved or booked
    for (const slot of timeSlots) {
      const key = `${date}-${slot}`;
      const existing = tempReservations.get(key);
      
      if (existing && existing.sessionId !== sessionId && Date.now() < existing.expiresAt) {
        return res.status(409).json({ 
          error: 'One or more slots are already reserved',
          conflictSlot: slot
        });
      }
      
      tempReservations.set(key, { sessionId, expiresAt });
      reservedSlots.push(slot);
    }
    
    // Notify other clients that these slots are now reserved
    io.emit('slotsReserved', { date, slots: reservedSlots, excludeSessionId: sessionId });
    
    res.json({ 
      success: true, 
      reservedUntil: expiresAt,
      message: `Slots reserved for 10 minutes`
    });
    
  } catch (error) {
    console.error('Error reserving slots:', error);
    res.status(500).json({ error: 'Failed to reserve slots' });
  }
});

// Book appointment (permanent)
app.post('/api/appointments', async (req, res) => {
  try {
    const { date, timeSlots, clientInfo, sessionId } = req.body;
    
    if (!date || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify slots are still reserved by this session
    for (const slot of timeSlots) {
      const key = `${date}-${slot}`;
      const reservation = tempReservations.get(key);
      
      if (!reservation || reservation.sessionId !== sessionId || Date.now() > reservation.expiresAt) {
        return res.status(409).json({ 
          error: 'Reservation expired or invalid',
          expiredSlot: slot
        });
      }
    }
    
    // Check for existing bookings (double-check)
    const existingAppointment = await Appointment.findOne({
      date,
      timeSlots: { $in: timeSlots },
      status: { $in: ['booked', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({ error: 'Slots already booked' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      date,
      timeSlots,
      clientInfo: clientInfo || {},
      sessionId
    });
    
    await appointment.save();
    
    // Remove temporary reservations
    timeSlots.forEach(slot => {
      tempReservations.delete(`${date}-${slot}`);
    });
    
    // Notify all clients about the booking
    io.emit('slotsBooked', { 
      date, 
      slots: timeSlots,
      appointmentId: appointment._id
    });
    
    res.status(201).json({
      success: true,
      appointment: {
        id: appointment._id,
        date: appointment.date,
        timeSlots: appointment.timeSlots,
        status: appointment.status
      }
    });
    
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Slots already booked' });
    }
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Cancel appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Optional: Only allow cancellation by the same session that created it
    // if (appointment.sessionId !== sessionId) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    // Notify clients that slots are available again
    io.emit('slotsAvailable', {
      date: appointment.date,
      slots: appointment.timeSlots
    });
    
    res.json({ success: true, message: 'Appointment cancelled' });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Get all appointments (admin route)
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Appointment.countDocuments(filter);
    
    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status (admin route)
app.put('/api/admin/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, clientInfo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (clientInfo) updateData.clientInfo = { ...clientInfo };
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // If cancelled, notify clients
    if (status === 'cancelled') {
      io.emit('slotsAvailable', {
        date: appointment.date,
        slots: appointment.timeSlots
      });
    }
    
    res.json({ success: true, appointment });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room for specific date to receive relevant updates
  socket.on('joinDate', (date) => {
    socket.join(`date-${date}`);
  });
  
  socket.on('leaveDate', (date) => {
    socket.leave(`date-${date}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    reservationsCount: tempReservations.size
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };