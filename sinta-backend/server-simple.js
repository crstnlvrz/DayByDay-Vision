// Load environment variables manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { db } = require('./database-simple');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sintá Restaurant API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// MENU ROUTES
// ============================================

// Get all menu items
app.get('/api/menu', (req, res) => {
  const { category, signature } = req.query;
  
  try {
    const items = db.getMenuItems({ category, signature });
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get signature dishes
app.get('/api/menu/signature', (req, res) => {
  try {
    const items = db.getMenuItems({ signature: 'true' });
    res.json(items);
  } catch (err) {
    console.error('Error fetching signature dishes:', err.message);
    res.status(500).json({ error: 'Failed to fetch signature dishes' });
  }
});

// ============================================
// RESERVATION ROUTES
// ============================================

// Check availability for a date/time
app.post('/api/reservations/check-availability', (req, res) => {
  const { date, time, partySize } = req.body;
  
  if (!date || !time || !partySize) {
    return res.status(400).json({ error: 'Date, time, and party size are required' });
  }
  
  try {
    const result = db.checkAvailability(date, time, partySize);
    res.json(result);
  } catch (err) {
    console.error('Error checking availability:', err.message);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Create reservation
app.post('/api/reservations', async (req, res) => {
  const {
    guestName, email, phone, partySize, reservationDate, reservationTime,
    occasionType, specialRequests, dietaryPreferences, paymentReference
  } = req.body;
  
  // Validation
  if (!guestName || !email || !phone || !partySize || !reservationDate || !reservationTime) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  
  try {
    const reservation = db.createReservation({
      guestName, email, phone, partySize, reservationDate, reservationTime,
      occasionType, specialRequests, dietaryPreferences, paymentReference
    });
    
    res.json({
      success: true,
      message: 'Reservation confirmed!',
      reservationId: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      details: {
        guestName: reservation.guest_name,
        partySize: reservation.party_size,
        date: reservation.reservation_date,
        time: reservation.reservation_time,
        depositAmount: reservation.deposit_amount,
        occasionType: reservation.occasion_type
      }
    });
  } catch (err) {
    console.error('Error creating reservation:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get reservation by ID
app.get('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const reservation = db.getReservationById(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (err) {
    console.error('Error fetching reservation:', err.message);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Cancel reservation
app.put('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  try {
    const reservation = db.cancelReservation(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling reservation:', err.message);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all reservations (Admin)
app.get('/api/admin/reservations', (req, res) => {
  const { date, status } = req.query;
  
  try {
    const reservations = db.getAllReservations({ date, status });
    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get dashboard statistics
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// WAITLIST ROUTES (Future Roadmap)
// ============================================

// Join waitlist
app.post('/api/waitlist', (req, res) => {
  const { guestName, email, phone, partySize, preferredDate, preferredTime, notes } = req.body;
  
  if (!guestName || !email || !phone || !partySize) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  
  try {
    const entry = db.addToWaitlist({
      guest_name: guestName, email, phone, party_size: partySize,
      preferred_date: preferredDate, preferred_time: preferredTime, notes
    });
    
    res.json({
      success: true,
      message: 'Added to waitlist. We will contact you when a table becomes available.',
      waitlistId: entry.id
    });
  } catch (err) {
    console.error('Error adding to waitlist:', err.message);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// ============================================
// LOYALTY PROGRAM ROUTES (Future Roadmap)
// ============================================

// Register loyalty member
app.post('/api/loyalty/register', (req, res) => {
  const { guestName, email, phone } = req.body;
  
  if (!guestName || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const member = db.registerLoyaltyMember({
      guest_name: guestName, email, phone: phone || null
    });
    
    res.json({
      success: true,
      message: 'Welcome to Sintá Circle!',
      memberId: member.id,
      tier: member.tier
    });
  } catch (err) {
    console.error('Error registering loyalty member:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🍽️  Sintá Restaurant Backend Server`);
  console.log(`   Running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api\n`);
});

module.exports = app;
