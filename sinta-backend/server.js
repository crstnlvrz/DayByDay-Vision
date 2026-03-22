const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Load environment variables manually
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

const { db, createAdminUser } = require('./database');
const fs = require('fs');
const path = require('path');

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

// Menu Routes - Updated for better-sqlite3

// Get all menu items
app.get('/api/menu', (req, res) => {
  const { category, signature } = req.query;
  
  let query = 'SELECT * FROM menu_items WHERE is_available = 1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (signature === 'true') {
    query += ' AND is_signature = 1';
  }
  
  query += ' ORDER BY category, price';
  
  try {
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get signature dishes
app.get('/api/menu/signature', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM menu_items WHERE is_signature = 1 AND is_available = 1');
    const rows = stmt.all();
    res.json(rows);
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
  
  // Calculate deposit requirement (PRD: mandatory for 4+ pax or peak hours)
  const isPeakHour = [18, 19, 20, 21].includes(parseInt(time.split(':')[0]));
  const requiresDeposit = partySize >= 4 || isPeakHour;
  const depositAmount = requiresDeposit ? Math.ceil(partySize * 500 / 100) * 100 : 0;
  
  // Check existing reservations for this time slot
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE reservation_date = ? 
      AND reservation_time = ? 
      AND status IN ('confirmed', 'pending')
    `);
    const row = stmt.get(date, time);
    
    // Assuming max 20 tables, 4 seats each = 80 covers per slot
    const maxCovers = 80;
    const currentCovers = row.count * 4; // Approximate
    const available = currentCovers + (partySize * 4) <= maxCovers;
    
    res.json({
      available,
      requiresDeposit,
      depositAmount,
      message: available 
        ? 'Table available' 
        : 'No tables available for this time slot',
      suggestedTimes: available ? [] : generateSuggestedTimes(time)
    });
  } catch (err) {
    console.error('Error checking availability:', err.message);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Generate suggested alternative times
function generateSuggestedTimes(originalTime) {
  const [hour, minute] = originalTime.split(':').map(Number);
  const suggestions = [];
  
  for (let offset = -2; offset <= 2; offset++) {
    if (offset === 0) continue;
    const newHour = hour + offset;
    if (newHour >= 17 && newHour <= 22) {
      suggestions.push(`${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  
  return suggestions;
}

// Create reservation
app.post('/api/reservations', async (req, res) => {
  const {
    guestName,
    email,
    phone,
    partySize,
    reservationDate,
    reservationTime,
    occasionType,
    specialRequests,
    dietaryPreferences,
    paymentReference
  } = req.body;
  
  // Validation
  if (!guestName || !email || !phone || !partySize || !reservationDate || !reservationTime) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  
  // Calculate deposit requirement
  const isPeakHour = [18, 19, 20, 21].includes(parseInt(reservationTime.split(':')[0]));
  const requiresDeposit = partySize >= 4 || isPeakHour;
  const depositAmount = requiresDeposit ? Math.ceil(partySize * 500 / 100) * 100 : 0;
  
  // If deposit is required, verify payment
  if (requiresDeposit && !paymentReference) {
    return res.status(400).json({ 
      error: 'Deposit payment is required for this reservation',
      depositAmount 
    });
  }
  
  const paymentStatus = requiresDeposit ? 'completed' : 'not_required';
  
  db.run(
    `INSERT INTO reservations 
     (guest_name, email, phone, party_size, reservation_date, reservation_time, 
      occasion_type, special_requests, dietary_preferences, deposit_amount, 
      payment_status, payment_reference, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
    [
      guestName, email, phone, partySize, reservationDate, reservationTime,
      occasionType || null, specialRequests || null, dietaryPreferences || null,
      depositAmount, paymentStatus, paymentReference || null
    ],
    function(err) {
      if (err) {
        console.error('Error creating reservation:', err.message);
        return res.status(500).json({ error: 'Failed to create reservation' });
      }
      
      res.json({
        success: true,
        message: 'Reservation confirmed!',
        reservationId: this.lastID,
        confirmationNumber: `SINTA-${this.lastID}-${new Date().getFullYear()}`,
        details: {
          guestName,
          partySize,
          date: reservationDate,
          time: reservationTime,
          depositAmount,
          occasionType
        }
      });
    }
  );
});

// Get reservation by ID
app.get('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM reservations WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching reservation:', err.message);
        return res.status(500).json({ error: 'Failed to fetch reservation' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      
      res.json(row);
    }
  );
});

// Cancel reservation
app.put('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  db.run(
    "UPDATE reservations SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id],
    function(err) {
      if (err) {
        console.error('Error cancelling reservation:', err.message);
        return res.status(500).json({ error: 'Failed to cancel reservation' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      
      res.json({ success: true, message: 'Reservation cancelled successfully' });
    }
  );
});

// ============================================
// ADMIN ROUTES (Protected - simplified for demo)
// ============================================

// Get all reservations (Admin)
app.get('/api/admin/reservations', (req, res) => {
  const { date, status } = req.query;
  
  let query = 'SELECT * FROM reservations';
  const params = [];
  const conditions = [];
  
  if (date) {
    conditions.push('reservation_date = ?');
    params.push(date);
  }
  
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY reservation_date, reservation_time';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching reservations:', err.message);
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
    res.json(rows);
  });
});

// Get dashboard statistics
app.get('/api/admin/stats', (req, res) => {
  const stats = {};
  
  // Total reservations today
  db.get(
    "SELECT COUNT(*) as count FROM reservations WHERE reservation_date = date('now') AND status = 'confirmed'",
    [],
    (err, row) => {
      stats.todayReservations = row ? row.count : 0;
      
      // Total revenue this month
      db.get(
        `SELECT SUM(deposit_amount) as total FROM reservations 
         WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') 
         AND payment_status = 'completed'`,
        [],
        (err, row) => {
          stats.monthlyRevenue = row ? row.total : 0;
          
          // Average party size
          db.get(
            "SELECT AVG(party_size) as avg FROM reservations WHERE status = 'confirmed'",
            [],
            (err, row) => {
              stats.averagePartySize = row ? parseFloat(row.avg).toFixed(1) : 0;
              
              res.json(stats);
            }
          );
        }
      );
    }
  );
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
  
  db.run(
    `INSERT INTO waitlist (guest_name, email, phone, party_size, preferred_date, preferred_time, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [guestName, email, phone, partySize, preferredDate || null, preferredTime || null, notes || null],
    function(err) {
      if (err) {
        console.error('Error adding to waitlist:', err.message);
        return res.status(500).json({ error: 'Failed to join waitlist' });
      }
      
      res.json({
        success: true,
        message: 'Added to waitlist. We will contact you when a table becomes available.',
        waitlistId: this.lastID
      });
    }
  );
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
  
  db.run(
    'INSERT INTO loyalty_members (guest_name, email, phone) VALUES (?, ?, ?)',
    [guestName, email, phone || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        console.error('Error registering loyalty member:', err.message);
        return res.status(500).json({ error: 'Failed to register' });
      }
      
      res.json({
        success: true,
        message: 'Welcome to Sintá Circle!',
        memberId: this.lastID,
        tier: 'silver'
      });
    }
  );
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
  
  // Create default admin user for testing
  setTimeout(() => {
    createAdminUser('admin@sinta-restaurant.com', 'SintaAdmin2024!')
      .catch(console.error);
  }, 1000);
});

module.exports = app;
