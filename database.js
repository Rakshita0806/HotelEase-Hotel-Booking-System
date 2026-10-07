const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'hotel.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    capacity INTEGER NOT NULL,
    beds INTEGER NOT NULL,
    size INTEGER,
    units INTEGER DEFAULT 1,
    status TEXT DEFAULT 'available',
    image TEXT,
    amenities TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'confirmed',
    requests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  );
`);

// Seed initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM rooms').get();
if (count.count === 0) {
  const seedRooms = [
  { name: 'Deluxe Ocean View', type: 'Deluxe', description: 'Wake up to panoramic ocean views from your private balcony.', price: 15000, capacity: 2, beds: 1, size: 45, units: 5, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800', amenities: 'Wi-Fi, Mini Bar, Ocean View, Balcony, Smart TV' },
  { name: 'Executive Suite', type: 'Suite', description: 'A spacious suite with a separate living area and executive lounge access.', price: 25000, capacity: 3, beds: 2, size: 75, units: 3, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', amenities: 'Wi-Fi, Lounge Access, King Bed, Marble Bath, City View' },
  { name: 'Presidential Penthouse', type: 'Penthouse', description: 'The ultimate luxury experience. Private rooftop terrace and butler service.', price: 85000, capacity: 4, beds: 3, size: 220, units: 1, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800', amenities: 'Butler, Private Pool, Rooftop, Panoramic View, Chef' },
  { name: 'Garden Villa', type: 'Villa', description: 'Secluded villa surrounded by lush tropical gardens and a private plunge pool.', price: 40000, capacity: 6, beds: 4, size: 180, units: 2, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', amenities: 'Private Pool, Kitchen, Garden, Wi-Fi, AC' },
  { name: 'Standard Queen', type: 'Standard', description: 'Cozy and elegant room perfect for solo travellers or couples.', price: 8000, capacity: 2, beds: 1, size: 28, units: 10, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800', amenities: 'Wi-Fi, Queen Bed, Smart TV, Work Desk' },
  { name: 'Family Loft', type: 'Family', description: 'Two-story loft designed for families with children.', price: 20000, capacity: 5, beds: 3, size: 95, units: 4, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800', amenities: 'Bunk Beds, Kitchenette, Wi-Fi, Kids Amenities' }
];
  const insert = db.prepare(`INSERT INTO rooms (name, type, description, price, capacity, beds, size, units, image, amenities) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const insertMany = db.transaction((rooms) => {
    for (const r of rooms) insert.run(r.name, r.type, r.description, r.price, r.capacity, r.beds, r.size, r.units, r.image, r.amenities);
  });
  insertMany(seedRooms);
  console.log('Seeded default rooms.');
}

module.exports = db;