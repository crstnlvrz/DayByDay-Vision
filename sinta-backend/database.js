const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './sinta.db';

// Initialize database connection
const db = new Database(DB_PATH);
console.log('Connected to SQLite database.');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables based on PRD requirements
function initializeTables() {
  // Users table for admin/staff
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reservations table with all PRD fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      party_size INTEGER NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      occasion_type TEXT,
      special_requests TEXT,
      dietary_preferences TEXT,
      deposit_amount REAL,
      payment_status TEXT DEFAULT 'pending',
      payment_reference TEXT,
      status TEXT DEFAULT 'confirmed',
      table_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      is_signature BOOLEAN DEFAULT 0,
      is_available BOOLEAN DEFAULT 1,
      dietary_tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  seedMenuItems();

  // Waitlist table for future roadmap
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      party_size INTEGER NOT NULL,
      preferred_date DATE,
      preferred_time TEXT,
      notes TEXT,
      status TEXT DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Loyalty members table (Future Roadmap)
  db.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      tier TEXT DEFAULT 'silver',
      points INTEGER DEFAULT 0,
      total_visits INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      member_since DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_visit DATETIME
    )
  `);
  
  console.log('Database tables initialized.');
}

// Seed initial menu items from PRD
function seedMenuItems() {
  const signatureDishes = [
    {
      name: 'Bulalo Ossobuco',
      description: 'A fusion masterpiece blending Filipino bulalo with Italian ossobuco. Slow-braised beef shank in rich bone marrow broth.',
      category: 'Main Course',
      price: 2800,
      is_signature: true,
      dietary_tags: 'gluten-free'
    },
    {
      name: 'Lamb Shank Ravioli',
      description: 'Handcrafted ravioli filled with tender lamb shank, served in a sage brown butter sauce.',
      category: 'Main Course',
      price: 2400,
      is_signature: true,
      dietary_tags: ''
    },
    {
      name: 'Double Espresso Soup',
      description: 'Chef Ariel Manuel\'s signature dessert - a rich espresso-based soup with vanilla bean ice cream and chocolate tuile.',
      category: 'Dessert',
      price: 650,
      is_signature: true,
      dietary_tags: 'vegetarian'
    },
    {
      name: 'Seared Scallops',
      description: 'Pan-seared Hokkaido scallops with cauliflower purée and truffle oil.',
      category: 'Appetizer',
      price: 980,
      is_signature: false,
      dietary_tags: 'gluten-free'
    },
    {
      name: 'Wagyu Beef Tartare',
      description: 'Premium wagyu beef tartare with quail egg, capers, and house-made crackers.',
      category: 'Appetizer',
      price: 1200,
      is_signature: false,
      dietary_tags: ''
    },
    {
      name: 'Truffle Mushroom Risotto',
      description: 'Arborio rice with wild mushrooms, black truffle, and aged parmesan.',
      category: 'Main Course',
      price: 1800,
      is_signature: false,
      dietary_tags: 'vegetarian,gluten-free'
    }
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO menu_items (name, description, category, price, is_signature, dietary_tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((dishes) => {
    for (const dish of dishes) {
      insertStmt.run(
        dish.name,
        dish.description,
        dish.category,
        dish.price,
        dish.is_signature ? 1 : 0,
        dish.dietary_tags
      );
    }
  });

  insertMany(signatureDishes);
  console.log('Menu items seeded successfully.');
}

// Helper function to create default admin user
async function createAdminUser(email, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const stmt = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
    stmt.run(email, passwordHash, 'admin');
    console.log('Admin user created successfully.');
  } catch (error) {
    if (!error.message.includes('UNIQUE constraint failed')) {
      console.error('Error creating admin user:', error.message);
    }
  }
}

// Initialize database on module load
initializeTables();

module.exports = { db, createAdminUser };
