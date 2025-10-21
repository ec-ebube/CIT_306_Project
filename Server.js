const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ FIXED: Serve static files from Frontend folder (correct path)
app.use(express.static(path.join(__dirname, 'Frontend')));

// ✅ Add specific routes for HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'Home.html'));
});

app.get('/Home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'Home.html'));
});

app.get('/admin_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'admin_dashboard.html'));
});

app.get('/TimeTable.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'TimeTable.html'));
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soe_board';

console.log('🔗 Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`📍 Database: ${MONGODB_URI}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Using in-memory storage as fallback');
    });

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

// Announcement Schema
const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, default: 'general' }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String },
    googleCalendarLink: { type: String }
});

const Event = mongoose.model('Event', eventSchema);

// Fallback in-memory storage
let fallbackAnnouncements = [];
let fallbackEvents = [];
let fallbackAdmin = { username: 'admin', password: 'admin123' };

// Check MongoDB connection status
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// =========================
// API Routes
// =========================

// Test endpoint
app.get('/api/test', (req, res) => {
    const dbStatus = isMongoConnected() ? 'Connected to MongoDB' : 'Using in-memory storage';
    res.json({
        message: 'Server is running! API is working!',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Admin Login
// app.post('/api/admin/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         console.log('Login attempt for:', username);

//         if (isMongoConnected()) {
//             // Use MongoDB
//             const admin = await Admin.findOne({ username });
//             if (!admin) {
//                 return res.status(401).json({ message: 'Invalid credentials' });
//             }

//             // Check password (plain text for demo)
//             if (admin.password !== password) {
//                 return res.status(401).json({ message: 'Invalid credentials' });
//             }

//             const token = jwt.sign(
//                 { id: admin._id, username: admin.username },
//                 process.env.JWT_SECRET || 'your-secret-key',
//                 { expiresIn: '24h' }
//             );

//             res.json({
//                 message: 'Login successful',
//                 token,
//                 admin: { id: admin._id, username: admin.username }
//             });
//         } else {
//             // Use fallback
//             if (username === fallbackAdmin.username && password === fallbackAdmin.password) {
//                 const token = jwt.sign(
//                     { username: fallbackAdmin.username },
//                     process.env.JWT_SECRET || 'your-secret-key',
//                     { expiresIn: '24h' }
//                 );

//                 res.json({
//                     message: 'Login successful (In-Memory)',
//                     token,
//                     admin: { username: fallbackAdmin.username }
//                 });
//             } else {
//                 res.status(401).json({ message: 'Invalid credentials' });
//             }
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for:', username);

        // Only use MongoDB - no fallback
        const admin = await Admin.find();
        console.log(admin[0]);
        // if (!admin) {
        //     console.log('Admin not found:', username);
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }

        // Check password (plain text for now - we'll hash later)
        // if (admin.password !== password) {
        //     console.log('Password mismatch for:', username);
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            admin: { id: admin._id, username: admin.username }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all announcements (public)
app.get('/api/announcements', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const announcements = await Announcement.find().sort({ date: -1 });
            res.json(announcements);
        } else {
            res.json(fallbackAnnouncements);
        }
    } catch (error) {
        console.error('Get announcements error:', error);
        res.json(fallbackAnnouncements);
    }
});

// Create announcement (admin only)
app.post('/api/announcements', authenticateToken, async (req, res) => {
    try {
        const { title, content, author, category } = req.body;
        console.log('Creating announcement:', { title, author });

        if (!title || !content || !author) {
            return res.status(400).json({ message: 'Title, content, and author are required' });
        }

        if (isMongoConnected()) {
            const announcement = new Announcement({
                title,
                content,
                author,
                category: category || 'general'
            });

            await announcement.save();
            res.status(201).json({ message: 'Announcement created successfully', announcement });
        } else {
            const announcement = {
                id: Date.now().toString(),
                title,
                content,
                author,
                category: category || 'general',
                date: new Date()
            };

            fallbackAnnouncements.unshift(announcement);
            res.status(201).json({ message: 'Announcement created successfully', announcement });
        }
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: 'Error creating announcement', error: error.message });
    }
});

// Get all events (public)
app.get('/api/events', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const events = await Event.find().sort({ date: 1 });
            res.json(events);
        } else {
            res.json(fallbackEvents);
        }
    } catch (error) {
        console.error('Get events error:', error);
        res.json(fallbackEvents);
    }
});

// Create event (admin only)
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;
        console.log('Creating event:', { title, date, location });

        if (!title || !date || !location) {
            return res.status(400).json({ message: 'Title, date, and location are required' });
        }

        if (isMongoConnected()) {
            const event = new Event({
                title,
                description: description || '',
                date: new Date(date),
                time: time || '',
                location,
                googleCalendarLink: ''
            });

            await event.save();
            res.status(201).json({ message: 'Event created successfully', event });
        } else {
            const event = {
                id: Date.now().toString(),
                title,
                description: description || '',
                date: new Date(date),
                time: time || '',
                location,
                googleCalendarLink: ''
            };

            fallbackEvents.push(event);
            res.status(201).json({ message: 'Event created successfully', event });
        }
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// Initialize default admin (run once)
app.post('/api/admin/init', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const existingAdmin = await Admin.findOne();
            if (existingAdmin) {
                return res.json({ message: 'Admin already exists' });
            }

            const admin = new Admin({
                username: 'admin',
                password: 'admin123'
            });

            await admin.save();
            res.json({ message: 'Default admin created successfully' });
        } else {
            res.json({ message: 'Using in-memory admin (admin/admin123)' });
        }
    } catch (error) {
        console.error('Init admin error:', error);
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
});

// Create sample data (run once)
app.post('/api/sample-data', async (req, res) => {
    try {
        if (isMongoConnected()) {
            // Clear existing data
            await Announcement.deleteMany({});
            await Event.deleteMany({});

            // Create sample announcements
            const sampleAnnouncements = [
                {
                    title: "Mid-Semester Examinations Schedule",
                    content: "The schedule for mid-semester examinations has been released. All students are advised to check the timetable and prepare accordingly.",
                    author: "Dean's Office",
                    date: new Date('2023-10-15')
                },
                {
                    title: "Hackathon 2023 Registration Open",
                    content: "Registration for the annual department hackathon is now open. Form teams of 3-5 members and register before October 30th.",
                    author: "Student Affairs",
                    date: new Date('2023-10-12')
                },
                {
                    title: "Library Hours Extension",
                    content: "The library will extend its opening hours during the examination period. New hours will be from 8:00 AM to 10:00 PM Monday to Saturday.",
                    author: "University Library",
                    date: new Date('2023-10-10')
                }
            ];

            // Create sample events
            const sampleEvents = [
                {
                    title: "Guest Lecture: AI in Modern Web Development",
                    description: "Join us for an exciting guest lecture on the latest trends in AI and web development.",
                    date: new Date('2023-10-20'),
                    time: "2:00 PM - 4:00 PM",
                    location: "Lecture Hall A"
                },
                {
                    title: "Career Development Workshop",
                    description: "Interactive career workshop for students focusing on resume building and interview skills.",
                    date: new Date('2023-10-25'),
                    time: "10:00 AM - 12:00 PM",
                    location: "Seminar Room B"
                },
                {
                    title: "Departmental Sports Day",
                    description: "Annual departmental sports day with various competitions and games.",
                    date: new Date('2023-10-28'),
                    time: "9:00 AM - 5:00 PM",
                    location: "University Stadium"
                }
            ];

            // Save to database
            await Announcement.insertMany(sampleAnnouncements);
            await Event.insertMany(sampleEvents);

            res.json({
                message: 'Sample data created successfully',
                announcements: sampleAnnouncements.length,
                events: sampleEvents.length
            });
        } else {
            // Create sample data for in-memory storage
            fallbackAnnouncements = [
                {
                    id: '1',
                    title: "Mid-Semester Examinations Schedule",
                    content: "The schedule for mid-semester examinations has been released. All students are advised to check the timetable and prepare accordingly.",
                    author: "Dean's Office",
                    date: new Date('2023-10-15'),
                    category: 'general'
                },
                {
                    id: '2',
                    title: "Hackathon 2023 Registration Open",
                    content: "Registration for the annual department hackathon is now open. Form teams of 3-5 members and register before October 30th.",
                    author: "Student Affairs",
                    date: new Date('2023-10-12'),
                    category: 'general'
                }
            ];

            fallbackEvents = [
                {
                    id: '1',
                    title: "Guest Lecture: AI in Modern Web Development",
                    description: "Join us for an exciting guest lecture on the latest trends in AI and web development.",
                    date: new Date('2023-10-20'),
                    time: "2:00 PM - 4:00 PM",
                    location: "Lecture Hall A",
                    googleCalendarLink: ""
                }
            ];

            res.json({
                message: 'Sample data created successfully (In-Memory)',
                announcements: fallbackAnnouncements.length,
                events: fallbackEvents.length
            });
        }
    } catch (error) {
        console.error('Sample data error:', error);
        res.status(500).json({ message: 'Error creating sample data', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Frontend: http://localhost:${PORT}`);
    console.log(`📍 API Test: http://localhost:${PORT}/api/test`);
    console.log(`📍 Initialize Admin: http://localhost:${PORT}/api/admin/init`);
    console.log(`📍 Create Sample Data: http://localhost:${PORT}/api/sample-data`);
    console.log(`🔑 Default credentials: username="admin", password="admin123"`);
});