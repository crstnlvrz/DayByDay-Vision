# Sintá Restaurant Backend API

Complete backend server for Sintá Restaurant's digital ecosystem, built with Node.js, Express, and SQLite.

## 🍽️ Features

### Core Functionality (PRD-Aligned)
- **Menu Management**: Retrieve signature dishes and full menu items
- **Advanced Reservation System**: 
  - Real-time availability checking
  - Deposit calculation (mandatory for 4+ guests or peak hours)
  - Dietary preference tagging
  - Special occasion notes
- **Admin Dashboard**: View reservations, statistics, and manage bookings
- **Waitlist Management**: Future roadmap feature
- **Loyalty Program**: Sintá Circle membership registration

### Signature Dishes Pre-loaded
- Bulalo Ossobuco (₱2,800)
- Lamb Shank Ravioli (₱2,400)
- Double Espresso Soup (₱650)
- Seared Scallops (₱980)
- Wagyu Beef Tartare (₱1,200)
- Truffle Mushroom Risotto (₱1,800)

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (optional - defaults provided)
cp .env.example .env

# Start the server
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Menu
```
GET /api/menu                    # Get all menu items
GET /api/menu?category=Main Course
GET /api/menu/signature          # Get signature dishes only
```

### Reservations
```
POST /api/reservations/check-availability
Body: { date: "2024-01-15", time: "19:00", partySize: 4 }

POST /api/reservations
Body: {
  guestName: "Juan Dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",
  partySize: 4,
  reservationDate: "2024-01-15",
  reservationTime: "19:00",
  occasionType: "Anniversary",
  specialRequests: "Window seat preferred",
  dietaryPreferences: "gluten-free",
  paymentReference: "GCASH123456"
}

GET /api/reservations/:id
PUT /api/reservations/:id/cancel
```

### Admin (Protected routes - simplify for demo)
```
GET /api/admin/reservations?date=2024-01-15&status=confirmed
GET /api/admin/stats
```

### Waitlist (Future Roadmap)
```
POST /api/waitlist
Body: {
  guestName: "Maria Santos",
  email: "maria@example.com",
  phone: "09171234567",
  partySize: 6,
  preferredDate: "2024-01-15",
  preferredTime: "19:00",
  notes: "Celebrating birthday"
}
```

### Loyalty Program (Future Roadmap)
```
POST /api/loyalty/register
Body: {
  guestName: "Pedro Reyes",
  email: "pedro@example.com",
  phone: "09171234567"
}
```

## 🗄️ Database Schema

### Tables Created Automatically:
- **users**: Admin and staff accounts
- **reservations**: All booking data with PRD fields
- **menu_items**: Restaurant menu with signature flags
- **waitlist**: Waitlist entries
- **loyalty_members**: Loyalty program members

Database file: `sinta.db` (created automatically on first run)

## 🔐 Default Admin Account

Created automatically on first startup:
- **Email**: admin@sinta-restaurant.com
- **Password**: SintaAdmin2024!

⚠️ **Change these credentials in production!**

## 📊 Deposit Logic (Per PRD)

The system automatically calculates deposit requirements:
- **Parties of 4 or more**: ₱500 per person deposit required
- **Peak hours (6PM-9PM)**: Deposit required regardless of party size
- **Off-peak, small parties**: No deposit required

Example calculations:
- 2 guests at 5:00 PM → No deposit
- 2 guests at 7:00 PM → ₱1,000 deposit
- 6 guests at any time → ₱3,000 deposit

## 🌐 CORS Configuration

By default, the API allows requests from:
- `http://localhost:5500` (for local frontend development)

Update `FRONTEND_URL` in `.env` for production deployment.

## 🧪 Testing with cURL

### Get Menu
```bash
curl http://localhost:3000/api/menu
```

### Get Signature Dishes
```bash
curl http://localhost:3000/api/menu/signature
```

### Check Availability
```bash
curl -X POST http://localhost:3000/api/reservations/check-availability \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-20","time":"19:00","partySize":4}'
```

### Create Reservation
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName":"Test Guest",
    "email":"test@example.com",
    "phone":"09171234567",
    "partySize":2,
    "reservationDate":"2024-01-20",
    "reservationTime":"18:00",
    "occasionType":"Birthday",
    "specialRequests":"Allergic to nuts",
    "dietaryPreferences":"gluten-free",
    "paymentReference":"TEST123"
  }'
```

## 📁 Project Structure

```
sinta-backend/
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── database.js         # Database initialization & schema
├── package.json        # Dependencies & scripts
├── README.md           # This file
├── server.js           # Main Express server
└── sinta.db            # SQLite database (auto-created)
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_PATH | SQLite database path | ./sinta.db |
| JWT_SECRET | JWT signing secret | (dev default) |
| FRONTEND_URL | Allowed CORS origin | http://localhost:5500 |
| PAYMENT_API_KEY | Payment gateway key | (placeholder) |
| SMTP_HOST | Email server host | smtp.gmail.com |
| SMTP_USER | Email server user | (placeholder) |

## 🚀 Production Deployment Notes

1. **Change all default secrets** in `.env`
2. **Use a production database** (PostgreSQL recommended for scale)
3. **Implement proper authentication** (JWT middleware)
4. **Set up SSL/TLS** for HTTPS
5. **Configure rate limiting** to prevent abuse
6. **Enable logging** (Winston, Morgan)
7. **Set up monitoring** (PM2, New Relic)
8. **Integrate real payment gateway** (GCash, Maya, Stripe)
9. **Configure email service** for confirmations

## 📝 License

ISC

---

**Sintá Restaurant** - Transformational Dining Experience  
Tagaytay/Talisay, Batangas
