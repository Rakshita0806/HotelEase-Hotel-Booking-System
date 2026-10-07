# 🏨 HotelEase — Hotel Room Booking System

HotelEase is a full-stack hotel room booking and management system designed to simplify room management, availability checking, guest booking, and booking cancellation through a responsive web interface.

The system allows hotel staff or administrators to manage rooms, check room availability for selected dates, create bookings, and manage existing reservations from a single dashboard.

Built using **HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and SQLite**, HotelEase provides a lightweight full-stack solution without requiring a frontend framework such as React.

---

## ✨ Features

- 🏨 Add, edit, and delete hotel rooms
- 🛏️ Manage different room types
- 💰 Set room prices per night
- 📅 Search room availability based on check-in and check-out dates
- 👤 Create guest bookings
- 🧾 Automatically calculate number of nights and total booking cost
- 🚫 Prevent overlapping room bookings
- ❌ Cancel existing bookings
- 📋 View all hotel bookings
- 🔎 Filter and manage booking records
- 📊 Display room and booking information through a dashboard
- 🌐 REST API-based backend
- 💾 Persistent data storage using SQLite
- 🖼️ Hotel room imagery in the availability interface
- 📱 Responsive web interface
- ⚡ Dynamic updates without manually refreshing the page
- 🎨 Modern hotel-themed UI with animated background effects
- 🔐 Server-side validation for important booking operations

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite |
| API | REST API |
| Data Format | JSON |
| HTTP Client | Fetch API |
| Development | Nodemon |
| Version Control | Git & GitHub |
| Images | Unsplash |
| Runtime | Node.js |

---

# 📁 Project Structure

```text
HotelEase-Hotel-Booking-System/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server.js
├── database.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── database/
    └── hotel.db