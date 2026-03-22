const fs = require('fs');
const path = require('path');

const DB_PATH = './sinta.db';

// Simple in-memory database for demo purposes
class SimpleDB {
  constructor() {
    this.data = {
      users: [],
      reservations: [],
      menu_items: [],
      waitlist: [],
      loyalty_members: []
    };
    this.loadFromFile();
    this.initializeTables();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(data);
      }
    } catch (err) {
      console.log('No existing database file found, starting fresh.');
    }
  }

  saveToFile() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  initializeTables() {
    // Seed menu items if empty
    if (this.data.menu_items.length === 0) {
      this.seedMenuItems();
    }
    console.log('Database initialized.');
  }

  seedMenuItems() {
    const signatureDishes = [
      {
        id: 1,
        name: 'Bulalo Ossobuco',
        description: 'A fusion masterpiece blending Filipino bulalo with Italian ossobuco. Slow-braised beef shank in rich bone marrow broth.',
        category: 'Main Course',
        price: 2800,
        is_signature: true,
        dietary_tags: 'gluten-free',
        is_available: true
      },
      {
        id: 2,
        name: 'Lamb Shank Ravioli',
        description: 'Handcrafted ravioli filled with tender lamb shank, served in a sage brown butter sauce.',
        category: 'Main Course',
        price: 2400,
        is_signature: true,
        dietary_tags: '',
        is_available: true
      },
      {
        id: 3,
        name: 'Double Espresso Soup',
        description: 'Chef Ariel Manuel\'s signature dessert - a rich espresso-based soup with vanilla bean ice cream and chocolate tuile.',
        category: 'Dessert',
        price: 650,
        is_signature: true,
        dietary_tags: 'vegetarian',
        is_available: true
      },
      {
        id: 4,
        name: 'Seared Scallops',
        description: 'Pan-seared Hokkaido scallops with cauliflower purée and truffle oil.',
        category: 'Appetizer',
        price: 980,
        is_signature: false,
        dietary_tags: 'gluten-free',
        is_available: true
      },
      {
        id: 5,
        name: 'Wagyu Beef Tartare',
        description: 'Premium wagyu beef tartare with quail egg, capers, and house-made crackers.',
        category: 'Appetizer',
        price: 1200,
        is_signature: false,
        dietary_tags: '',
        is_available: true
      },
      {
        id: 6,
        name: 'Truffle Mushroom Risotto',
        description: 'Arborio rice with wild mushrooms, black truffle, and aged parmesan.',
        category: 'Main Course',
        price: 1800,
        is_signature: false,
        dietary_tags: 'vegetarian,gluten-free',
        is_available: true
      }
    ];

    this.data.menu_items = signatureDishes;
    this.saveToFile();
    console.log('Menu items seeded successfully.');
  }

  // Menu methods
  getMenuItems(filters = {}) {
    let items = this.data.menu_items.filter(item => item.is_available);
    
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }
    
    if (filters.signature === 'true') {
      items = items.filter(item => item.is_signature);
    }
    
    return items.sort((a, b) => a.price - b.price);
  }

  // Reservation methods
  checkAvailability(date, time, partySize) {
    const count = this.data.reservations.filter(r => 
      r.reservation_date === date && 
      r.reservation_time === time && 
      ['confirmed', 'pending'].includes(r.status)
    ).length;
    
    const maxCovers = 80;
    const currentCovers = count * 4;
    const available = currentCovers + (partySize * 4) <= maxCovers;
    
    const isPeakHour = [18, 19, 20, 21].includes(parseInt(time.split(':')[0]));
    const requiresDeposit = partySize >= 4 || isPeakHour;
    const depositAmount = requiresDeposit ? Math.ceil(partySize * 500 / 100) * 100 : 0;
    
    return {
      available,
      requiresDeposit,
      depositAmount,
      message: available ? 'Table available' : 'No tables available for this time slot',
      suggestedTimes: available ? [] : this.generateSuggestedTimes(time)
    };
  }

  generateSuggestedTimes(originalTime) {
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

  createReservation(reservationData) {
    const {
      guestName, email, phone, partySize, reservationDate, reservationTime,
      occasionType, specialRequests, dietaryPreferences, paymentReference
    } = reservationData;
    
    const isPeakHour = [18, 19, 20, 21].includes(parseInt(reservationTime.split(':')[0]));
    const requiresDeposit = partySize >= 4 || isPeakHour;
    const depositAmount = requiresDeposit ? Math.ceil(partySize * 500 / 100) * 100 : 0;
    
    if (requiresDeposit && !paymentReference) {
      throw new Error('Deposit payment is required for this reservation');
    }
    
    const newReservation = {
      id: this.data.reservations.length > 0 
        ? Math.max(...this.data.reservations.map(r => r.id)) + 1 
        : 1,
      guest_name: guestName,
      email,
      phone,
      party_size: partySize,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      occasion_type: occasionType || null,
      special_requests: specialRequests || null,
      dietary_preferences: dietaryPreferences || null,
      deposit_amount: depositAmount,
      payment_status: requiresDeposit ? 'completed' : 'not_required',
      payment_reference: paymentReference || null,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.reservations.push(newReservation);
    this.saveToFile();
    
    return {
      ...newReservation,
      confirmationNumber: `SINTA-${newReservation.id}-${new Date().getFullYear()}`
    };
  }

  getReservationById(id) {
    return this.data.reservations.find(r => r.id === parseInt(id));
  }

  cancelReservation(id) {
    const reservation = this.data.reservations.find(r => r.id === parseInt(id));
    if (!reservation) return null;
    
    reservation.status = 'cancelled';
    reservation.updated_at = new Date().toISOString();
    this.saveToFile();
    
    return reservation;
  }

  getAllReservations(filters = {}) {
    let reservations = [...this.data.reservations];
    
    if (filters.date) {
      reservations = reservations.filter(r => r.reservation_date === filters.date);
    }
    
    if (filters.status) {
      reservations = reservations.filter(r => r.status === filters.status);
    }
    
    return reservations.sort((a, b) => 
      new Date(a.reservation_date + 'T' + a.reservation_time) - 
      new Date(b.reservation_date + 'T' + b.reservation_time)
    );
  }

  getStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayReservations = this.data.reservations.filter(r => 
      r.reservation_date === today && r.status === 'confirmed'
    ).length;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = this.data.reservations
      .filter(r => 
        r.created_at.startsWith(currentMonth) && 
        r.payment_status === 'completed'
      )
      .reduce((sum, r) => sum + (r.deposit_amount || 0), 0);
    
    const confirmedReservations = this.data.reservations.filter(r => r.status === 'confirmed');
    const averagePartySize = confirmedReservations.length > 0
      ? (confirmedReservations.reduce((sum, r) => sum + r.party_size, 0) / confirmedReservations.length).toFixed(1)
      : 0;
    
    return {
      todayReservations,
      monthlyRevenue,
      averagePartySize
    };
  }

  // Waitlist methods
  addToWaitlist(waitlistData) {
    const newEntry = {
      id: this.data.waitlist.length > 0 
        ? Math.max(...this.data.waitlist.map(w => w.id)) + 1 
        : 1,
      ...waitlistData,
      status: 'waiting',
      created_at: new Date().toISOString()
    };
    
    this.data.waitlist.push(newEntry);
    this.saveToFile();
    
    return newEntry;
  }

  // Loyalty methods
  registerLoyaltyMember(memberData) {
    const existing = this.data.loyalty_members.find(m => m.email === memberData.email);
    if (existing) {
      throw new Error('Email already registered');
    }
    
    const newMember = {
      id: this.data.loyalty_members.length > 0 
        ? Math.max(...this.data.loyalty_members.map(m => m.id)) + 1 
        : 1,
      ...memberData,
      tier: 'silver',
      points: 0,
      total_visits: 0,
      total_spent: 0,
      member_since: new Date().toISOString()
    };
    
    this.data.loyalty_members.push(newMember);
    this.saveToFile();
    
    return newMember;
  }
}

const db = new SimpleDB();

module.exports = { db };
