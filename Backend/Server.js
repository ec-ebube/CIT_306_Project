const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware - Improved CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('../frontend')); // Serve frontend files

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soe_board', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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

// Routes

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile('Home.html', { root: '../frontend' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for:', username);

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = password === admin.password;

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
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
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: 'Error fetching announcements', error: error.message });
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

        const announcement = new Announcement({
            title,
            content,
            author,
            category: category || 'general'
        });

        await announcement.save();
        res.status(201).json({ message: 'Announcement created successfully', announcement });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: 'Error creating announcement', error: error.message });
    }
});

// Get all events (public)
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
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
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// Initialize default admin (run once)
app.post('/api/admin/init', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.json({ message: 'Admin already exists' });
        }

        // Create default admin
        const admin = new Admin({
            username: 'admin',
            password: 'admin123'
        });

        await admin.save();
        res.json({ message: 'Default admin created successfully' });
    } catch (error) {
        console.error('Init admin error:', error);
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Frontend: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/`);
    console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
});