const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.ensureDirSync(dataDir);
fs.ensureDirSync(uploadsDir);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Helper functions to read/write data
function getConfig() {
    const configPath = path.join(dataDir, 'config.json');
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {
        businessName: 'Beauty Studio',
        email: 'contact@beautystudio.com',
        phone: '+1 (555) 123-4567',
        location: 'Your City, State',
        instagram: 'https://instagram.com/beautystudio',
        heroImage: ''
    };
}

function saveConfig(config) {
    const configPath = path.join(dataDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getGallery() {
    const galleryPath = path.join(dataDir, 'gallery.json');
    if (fs.existsSync(galleryPath)) {
        return JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
    }
    return [];
}

function saveGallery(gallery) {
    const galleryPath = path.join(dataDir, 'gallery.json');
    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
}

function getPasswordHash() {
    const passwordPath = path.join(dataDir, 'password.json');
    if (fs.existsSync(passwordPath)) {
        const data = JSON.parse(fs.readFileSync(passwordPath, 'utf8'));
        return data.hash;
    }
    // Default password: "admin123" - CHANGE THIS!
    const defaultHash = bcrypt.hashSync('admin123', 10);
    fs.writeFileSync(passwordPath, JSON.stringify({ hash: defaultHash }, null, 2));
    return defaultHash;
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// Public Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// API Routes - Public
app.get('/api/config', (req, res) => {
    res.json(getConfig());
});

app.get('/api/gallery', (req, res) => {
    res.json(getGallery());
});

// Admin Routes
app.get('/admin', (req, res) => {
    if (req.session && req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    const hash = getPasswordHash();
    
    try {
        const match = await bcrypt.compare(password, hash);
        if (match) {
            req.session.authenticated = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Login error' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/admin/config', requireAuth, (req, res) => {
    res.json(getConfig());
});

app.post('/api/admin/config', requireAuth, (req, res) => {
    try {
        saveConfig(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/hero-image', requireAuth, (req, res, next) => {
    upload.single('heroImage')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
                }
                return res.status(400).json({ success: false, error: err.message });
            }
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No image file provided' });
            }

            const config = getConfig();
            // Delete old hero image if exists
            if (config.heroImage && config.heroImage.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, 'public', config.heroImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            config.heroImage = '/uploads/' + req.file.filename;
            saveConfig(config);
            res.json({ success: true, heroImage: config.heroImage });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

app.post('/api/admin/password', requireAuth, async (req, res) => {
    const { newPassword } = req.body;
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        const passwordPath = path.join(dataDir, 'password.json');
        fs.writeFileSync(passwordPath, JSON.stringify({ hash }, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/gallery', requireAuth, (req, res) => {
    res.json(getGallery());
});

app.post('/api/admin/gallery', requireAuth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            // Handle Multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB. Please compress your image or use a smaller file.' });
                }
                return res.status(400).json({ success: false, error: err.message });
            }
            // Handle other upload errors
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No image file provided' });
            }

            const gallery = getGallery();
            const newItem = {
                id: Date.now().toString(),
                image: '/uploads/' + req.file.filename,
                category: req.body.category || 'all',
                title: req.body.title || 'Gallery Item',
                order: gallery.length
            };

            gallery.push(newItem);
            saveGallery(gallery);
            res.json({ success: true, item: newItem });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
    try {
        const gallery = getGallery();
        const item = gallery.find(i => i.id === req.params.id);
        
        if (item) {
            // Delete the image file
            const imagePath = path.join(__dirname, 'public', item.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const filtered = gallery.filter(i => i.id !== req.params.id);
        saveGallery(filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/gallery/:id', requireAuth, (req, res) => {
    try {
        const gallery = getGallery();
        const index = gallery.findIndex(i => i.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        gallery[index] = { ...gallery[index], ...req.body };
        saveGallery(gallery);
        res.json({ success: true, item: gallery[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/gallery/reorder', requireAuth, (req, res) => {
    try {
        const { items } = req.body;
        saveGallery(items);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Booking API endpoint
app.post('/api/booking', async (req, res) => {
    const { name, email, phone, date, time, service, message } = req.body;

    try {
        const results = [];
        const config = getConfig();
        
        // Send email notification
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await sendBookingEmail({ name, email, phone, date, time, service, message }, config);
                results.push('email sent');
            } catch (error) {
                console.error('Email error:', error);
                results.push('email failed');
            }
        }

        // Log to Google Sheets
        if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
            try {
                await logToGoogleSheets({ name, email, phone, date, time, service, message });
                results.push('sheet updated');
            } catch (error) {
                console.error('Google Sheets error:', error);
                results.push('sheet failed');
            }
        }

        if (results.length === 0) {
            console.log('New booking request (no email/sheets configured):', { name, email, phone, date, time, service, message });
        }

        res.json({ success: true, message: 'Booking request submitted successfully!' });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: 'Error processing booking request' });
    }
});

// Email sending function
async function sendBookingEmail(bookingData, config) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: config.email || process.env.EMAIL_USER,
        subject: `New Booking Request from ${bookingData.name}`,
        html: `
            <h2>New Booking Request</h2>
            <p><strong>Name:</strong> ${bookingData.name}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Phone:</strong> ${bookingData.phone}</p>
            <p><strong>Date:</strong> ${bookingData.date}</p>
            <p><strong>Time:</strong> ${bookingData.time}</p>
            <p><strong>Service:</strong> ${bookingData.service}</p>
            <p><strong>Message:</strong> ${bookingData.message || 'N/A'}</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Google Sheets logging function
async function logToGoogleSheets(bookingData) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const values = [[
            new Date().toISOString(),
            bookingData.name,
            bookingData.email,
            bookingData.phone,
            bookingData.date,
            bookingData.time,
            bookingData.service,
            bookingData.message || ''
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Bookings!A:H',
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });
    } catch (error) {
        console.error('Google Sheets error:', error);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`Default admin password: admin123 - CHANGE THIS!`);
});
