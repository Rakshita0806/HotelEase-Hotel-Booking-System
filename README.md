🏨 HotelEase — Hotel Room Booking System
HotelEase is a full-stack hotel room booking and management system designed to simplify room management, availability checking, guest booking, and reservation cancellation through a responsive web interface.
The system allows hotel staff or administrators to manage hotel rooms, check room availability for selected dates, create guest bookings, view existing reservations, and cancel bookings from a centralized dashboard.
Built using HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and SQLite, HotelEase provides a lightweight full-stack solution without requiring frontend frameworks such as React.
Add screenshots or a demo GIF here for a stronger GitHub portfolio presentation.

✨ Features
* 🏨 Add, edit, and delete hotel rooms
* 🛏️ Manage different room types
* 💰 Set room prices per night
* 📅 Search room availability by check-in and check-out dates
* 👤 Create guest bookings
* 🧾 Automatically calculate number of nights
* 💵 Automatically calculate total booking cost
* 🚫 Prevent overlapping room bookings
* ❌ Cancel existing bookings
* 📋 View all hotel bookings
* 🔎 Search and filter booking records
* 📊 Dashboard for rooms and bookings
* 🌐 REST API-based backend
* 💾 Persistent data storage using SQLite
* 🖼️ Hotel room imagery in the availability interface
* 📱 Responsive web interface
* ⚡ Dynamic updates without manually refreshing the page
* 🎨 Modern hotel-themed user interface
* ✨ Animated background effects
* 🔐 Server-side validation for important booking operations
* 🛡️ Prevent invalid room and booking data

🛠️ Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript
Backend	Node.js, Express.js
Database	SQLite
API	REST API
Data Format	JSON
HTTP Client	Fetch API
Development	Nodemon
Version Control	Git & GitHub
Images	Unsplash
Runtime	Node.js
📁 Project Structure
HotelEase-Hotel-Booking-System/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── database/
│   └── hotel.db
│
├── server.js
├── database.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore

📋 Prerequisites
Before running HotelEase, make sure the following software is installed:
* Node.js v18 or later
* npm
* Git
* A modern web browser
Check your Node.js and npm installation:
node -v
npm -v

🚀 Installation and Setup
1. Clone the Repository
git clone https://github.com/Rakshita0806/HotelEase-Hotel-Booking-System.git
Move into the project directory:
cd HotelEase-Hotel-Booking-System

2. Install Dependencies
Install all required Node.js packages:
npm install

3. Start the Application
Development Mode
If Nodemon is configured in the project:
npm run dev
Normal Mode
npm start

4. Open the Application
After starting the server, open:
http://localhost:3000
The exact port depends on the configuration in server.js.
The SQLite database is created automatically when the application is initialized.

📜 Available Scripts
Command	Description
npm run dev	Starts the server using Nodemon
npm start	Starts the server using Node.js
🔄 Main Workflow
The main HotelEase workflow is:
1. Add hotel rooms with room number, type, and price.
2. View all available rooms from the dashboard.
3. Select check-in and check-out dates.
4. Search for rooms available during the selected dates.
5. Select an available room.
6. Enter guest information.
7. Create the booking.
8. The system calculates the number of nights automatically.
9. The total booking cost is calculated automatically.
10. The booking is stored in the SQLite database.
11. Existing bookings can be viewed from the booking dashboard.
12. A booking can be cancelled when required.
13. Room availability is updated automatically.

🌐 REST API
Base URL:
http://localhost:3000
Room Endpoints
Method	Endpoint	Description
GET	/api/rooms	Get all hotel rooms
GET	/api/rooms/:id	Get a specific room
POST	/api/rooms	Add a new room
PUT	/api/rooms/:id	Update an existing room
DELETE	/api/rooms/:id	Delete a room
Booking Endpoints
Method	Endpoint	Description
GET	/api/bookings	Get all bookings
GET	/api/bookings/:id	Get a specific booking
POST	/api/bookings	Create a new booking
DELETE	/api/bookings/:id	Cancel a booking
Availability Endpoint
Method	Endpoint	Description
GET	/api/rooms/available	Find rooms available for selected dates
Example:
GET /api/rooms/available?checkIn=2026-12-10&checkOut=2026-12-13

🏨 Example: Add a Room
POST /api/rooms

{
  "room_number": "101",
  "room_type": "Deluxe",
  "price": 3500
}

👤 Example: Create a Booking
POST /api/bookings

{
  "room_id": 1,
  "guest_name": "Alex Johnson",
  "guest_email": "alex@example.com",
  "check_in": "2026-12-10",
  "check_out": "2026-12-13"
}
The system calculates:
Number of Nights = Check-out Date - Check-in Date

Total Cost = Number of Nights × Room Price
For example:
Room Price      = ₹3500/night
Number of Nights = 3

Total Cost = ₹3500 × 3
           = ₹10500

🔐 Validation Rules
HotelEase performs validation to prevent invalid room and booking operations.
Room Validation
* Room number is required.
* Room type is required.
* Room price must be a valid positive value.
* Duplicate room numbers should not be allowed.
* Invalid room records are rejected by the server.
Booking Validation
* Guest name is required.
* Guest email must be valid.
* Room selection is required.
* Check-in date is required.
* Check-out date is required.
* Check-out date must be later than check-in date.
* Room must be available for the selected dates.
* Overlapping bookings are prevented.
* Invalid booking requests are rejected by the server.

🚫 Booking Conflict Prevention
HotelEase prevents a room from being booked by multiple guests for overlapping dates.
For example:
Booking 1:
Room: 101
Check-in: 10 Dec
Check-out: 15 Dec

Booking 2:
Room: 101
Check-in: 12 Dec
Check-out: 17 Dec
The second booking is rejected because the dates overlap.
This prevents double-booking and keeps room availability accurate.

💾 Database
HotelEase uses SQLite for persistent data storage.
The database file is stored inside:
database/
└── hotel.db
SQLite was selected because it is lightweight, easy to configure, and suitable for a small-to-medium full-stack academic project without requiring a separate database server.

🗄️ Database Schema
Rooms Table
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT NOT NULL UNIQUE,
    room_type TEXT NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
Bookings Table
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    total_cost REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

🧮 Booking Cost Calculation
The total booking cost is calculated based on the room's price and the number of nights.
Number of Nights = Check-out Date - Check-in Date

Total Cost = Room Price × Number of Nights
Example:
Room Price      = ₹2500
Check-in        = 10 December
Check-out       = 13 December

Number of Nights = 3

Total Cost = ₹2500 × 3
           = ₹7500
The calculation is performed dynamically when a booking is created.

🖥️ User Interface
The HotelEase frontend provides a responsive dashboard containing sections for:
🏨 Room Management
Administrators can:
* Add rooms
* Edit room details
* Delete rooms
* View room types
* View room prices
📅 Availability Search
Users can:
* Select check-in date
* Select check-out date
* Search available rooms
* View room information
* View room images
* Select a room for booking
👤 Guest Booking
Users can enter:
* Guest name
* Guest email
* Check-in date
* Check-out date
* Selected room
The application automatically calculates the booking duration and total price.
📋 Booking Management
Administrators can:
* View all bookings
* Search bookings
* Review guest information
* Check booking dates
* View total booking cost
* Cancel bookings

🖼️ Hotel Room Images
HotelEase uses online hotel imagery to improve the visual presentation of available rooms.
Images can be sourced from:
* Unsplash
* Other publicly accessible image URLs
Images are loaded directly through the frontend instead of requiring a separate local image folder.

✨ Animated Background
The HotelEase interface includes a modern animated background effect to improve the visual appearance of the dashboard.
The animation is implemented using frontend CSS/JavaScript techniques and does not require a frontend framework.
The interface is designed to remain functional even when animations are disabled or unsupported by the browser.

🔄 Dynamic Frontend Updates
HotelEase uses the JavaScript Fetch API to communicate with the Express.js REST API.
The general request flow is:
User Action
     ↓
Vanilla JavaScript
     ↓
Fetch API
     ↓
Express.js Server
     ↓
SQLite Database
     ↓
JSON Response
     ↓
Frontend UI Update
This allows room and booking information to update dynamically without requiring a full page reload.

🧪 Manual Testing Checklist
Test	Expected Result
Add room with valid details	Room is created successfully
Add room with missing details	Validation error appears
Add duplicate room number	Duplicate room is rejected
Edit room information	Updated information is displayed
Delete room	Room is removed
Search available rooms	Only available rooms are displayed
Book available room	Booking is created successfully
Book already reserved room	Booking is rejected
Use invalid check-in date	Validation error appears
Use check-out before check-in	Booking is rejected
Calculate booking cost	Correct total is displayed
View all bookings	Booking records are displayed
Cancel booking	Booking is removed/cancelled
Refresh page	Stored data remains available
Restart server	SQLite data remains persistent
Open on mobile screen	Responsive layout is displayed
🛠️ Troubleshooting
Problem	Solution
Port 3000 is already in use	Stop the other process or change the server port
npm install fails	Check Node.js and npm installation
Database is not created	Restart the Node.js server
Room cannot be booked	Check whether the selected dates overlap an existing booking
Changes do not appear	Perform a hard refresh using Ctrl + Shift + R or Cmd + Shift + R
Images are not loading	Check internet connection and image URL availability
Server is not starting	Check the terminal for Node.js or dependency errors
Database needs a fresh start	Stop the server and remove the SQLite database, then restart
🔄 Reset Database
To start the application with a fresh database:
1. Stop the running server.
2. Delete the SQLite database file:
database/hotel.db
1. Start the application again:
npm run dev
The application will create a new database during initialization.
⚠️ Resetting the database permanently removes the existing rooms and booking records. Humanity has invented backups for precisely this reason.

📌 Project Highlights
HotelEase demonstrates the implementation of:
* Full-stack web application development
* Client-server architecture
* REST API development
* CRUD operations
* SQLite database integration
* Relational database concepts
* Date-based availability checking
* Booking conflict prevention
* Dynamic frontend rendering
* Form validation
* Server-side validation
* JSON-based communication
* Responsive web design
* Git and GitHub version control

🚀 Future Improvements
Possible future enhancements include:
* 🔐 User authentication
* 👨‍💼 Admin and staff role-based access
* 💳 Online payment integration
* 📧 Booking confirmation emails
* 📱 SMS booking notifications
* 🧾 Automatic invoice generation
* 📊 Advanced hotel analytics dashboard
* ⭐ Guest review and rating system
* 🏷️ Discount and coupon management
* 📷 QR-code based booking verification
* ☁️ Cloud database deployment
* 🌍 Multi-hotel support
* 📱 Progressive Web App support

🔒 Security Considerations
For a production deployment, additional security measures should be implemented, including:
* Authentication and authorization
* Password hashing
* Input sanitization
* Rate limiting
* Secure HTTP headers
* HTTPS
* Environment variables for configuration
* Database backups
* API access control

📚 Learning Outcomes
This project provides practical experience with:
1. Designing a full-stack web application.
2. Creating RESTful APIs using Express.js.
3. Connecting a Node.js application with SQLite.
4. Performing CRUD database operations.
5. Handling frontend and backend communication using Fetch API.
6. Implementing date-based booking logic.
7. Preventing overlapping reservations.
8. Performing client-side and server-side validation.
9. Creating responsive interfaces using HTML and CSS.
10. Managing source code using Git and GitHub.

📄 License
This project is developed for educational and academic purposes.
If an MIT License is included in the repository, this project can be distributed under the MIT License.

🙏 Acknowledgements
* Unsplash for hotel imagery
* Node.js for the runtime environment
* Express.js for backend development
* SQLite for database storage
* GitHub for version control and repository hosting

🏨 HotelEase
Hotel room management made simple.
Built with ❤️ using HTML, CSS, JavaScript, Node.js, Express.js, and SQLite.
