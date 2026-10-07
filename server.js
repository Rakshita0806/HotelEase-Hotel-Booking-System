const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── ROOM ROUTES ─────────────────────────────────────────

app.get('/api/rooms', (req, res) => {
  const { search, type, capacity, sort } = req.query;
  let query = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (capacity) {
    query += ' AND capacity >= ?';
    params.push(capacity);
  }

  if (sort === 'price-asc') query += ' ORDER BY price ASC';
  else if (sort === 'price-desc') query += ' ORDER BY price DESC';
  else if (sort === 'name') query += ' ORDER BY name ASC';
  else query += ' ORDER BY id DESC';

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Room not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', (req, res) => {
  const { name, type, description, price, capacity, beds, size, units, image, amenities } = req.body;
  try {
    const info = db.prepare(
      `INSERT INTO rooms (name, type, description, price, capacity, beds, size, units, image, amenities)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).run(name, type, description, price, capacity, beds, size, units, image, amenities);
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', (req, res) => {
  const { name, type, description, price, capacity, beds, size, units, status, image, amenities } = req.body;
  try {
    const info = db.prepare(
      `UPDATE rooms SET name=?, type=?, description=?, price=?, capacity=?, beds=?, size=?, units=?, status=?, image=?, amenities=? WHERE id=?`
    ).run(name, type, description, price, capacity, beds, size, units, status, image, amenities, req.params.id);
    res.json({ message: 'Room updated', changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
    res.json({ message: 'Room deleted', changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BOOKING ROUTES ───────────────────────────────────────

app.get('/api/check-availability/:roomId', (req, res) => {
  const { checkIn, checkOut } = req.query;
  const { roomId } = req.params;

  if (!checkIn || !checkOut) return res.status(400).json({ error: 'Missing dates' });

  try {
    const room = db.prepare('SELECT units FROM rooms WHERE id = ?').get(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const row = db.prepare(
      `SELECT SUM(guests) as booked FROM bookings
       WHERE room_id = ? AND status != 'cancelled'
       AND check_in < ? AND check_out > ?`
    ).get(roomId, checkOut, checkIn);

    const booked = row.booked || 0;
    const available = room.units - booked;
    res.json({ available: available > 0, unitsLeft: available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', (req, res) => {
  const { search, status } = req.query;
  let query = `SELECT b.*, r.name as room_name FROM bookings b
               JOIN rooms r ON b.room_id = r.id WHERE 1=1`;
  const params = [];

  if (search) {
    query += ' AND (b.guest_name LIKE ? OR b.email LIKE ? OR r.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }
  query += ' ORDER BY b.id DESC';

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  const { room_id, guest_name, email, phone, check_in, check_out, guests, total_price, requests } = req.body;
  try {
    const info = db.prepare(
      `INSERT INTO bookings (room_id, guest_name, email, phone, check_in, check_out, guests, total_price, requests)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(room_id, guest_name, email, phone, check_in, check_out, guests, total_price, requests);
    res.json({ id: info.lastInsertRowid, ...req.body, status: 'confirmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', (req, res) => {
  const { status } = req.body;
  try {
    const info = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Booking updated', changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Booking deleted', changes: info.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATS ROUTE ──────────────────────────────────────────

app.get('/api/stats', (req, res) => {
  try {
    const roomStats = db.prepare('SELECT COUNT(*) as totalRooms, SUM(units) as totalUnits FROM rooms').get();
    const bookStats = db.prepare("SELECT COUNT(*) as totalBookings, SUM(total_price) as revenue FROM bookings WHERE status != 'cancelled'").get();
    const today = new Date().toISOString().split('T')[0];
    const active = db.prepare(
      `SELECT COUNT(*) as activeBookings FROM bookings
       WHERE status = 'confirmed' AND check_in <= ? AND check_out > ?`
    ).get(today, today);

    const totalUnits = roomStats.totalUnits || 1;
    const occupancy = Math.round(((active.activeBookings || 0) / totalUnits) * 100);

    res.json({
      totalRooms: roomStats.totalRooms || 0,
      totalBookings: bookStats.totalBookings || 0,
      revenue: bookStats.revenue || 0,
      occupancy: occupancy > 100 ? 100 : occupancy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏨 Aurum Grand Hotel running at http://localhost:${PORT}`);
});