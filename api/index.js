const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Import storage abstraction and session store
const storage = require('../lib/storage');
const sessionStore = require('../lib/session-store');

const app = express();

// Session configuration with safe defaults
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.VERCEL === '1', // Secure cookies on Vercel (HTTPS)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.VERCEL === '1' ? 'none' : 'lax',
        httpOnly: true
    }
};

// Use Redis store if available, otherwise use memory store (default)
// This is safe - if sessionStore is null/undefined, Express uses memory store
try {
    if (sessionStore) {
        sessionConfig.store = sessionStore;
    }
} catch (error) {
    console.warn('Session store initialization failed, using memory store:', error.message);
    // Continue with memory store (default)
}

app.use(session(sessionConfig));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
// Wrap in try-catch to prevent crashes if directory doesn't exist
try {
    app.use(express.static(path.join(__dirname, '..', 'public'), {
        maxAge: '1d',
        etag: true,
        lastModified: true
    }));
} catch (error) {
    console.warn('Static file serving setup warning:', error.message);
    // Continue - static files might not be critical for API routes
}

// Multer configuration for file uploads (memory storage for serverless)
const upload = multer({
    storage: multer.memoryStorage(), // Store in memory, then upload to blob storage
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

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

// ==================== Public Routes ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'gallery.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'booking.html'));
});

// ==================== Public API Routes ====================

app.get('/api/config', async (req, res) => {
    try {
        const config = await storage.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error getting config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await storage.getGallery();
        // Ensure all image paths are correct
        const galleryWithPaths = gallery.map(item => ({
            ...item,
            image: item.image && (item.image.startsWith('http') || item.image.startsWith('/')) 
                ? item.image 
                : '/' + (item.image || '')
        }));
        res.json(galleryWithPaths);
    } catch (error) {
        console.error('Error getting gallery:', error);
        res.status(500).json({ error: 'Failed to load gallery' });
    }
});

// ==================== Admin Routes ====================

app.get('/admin', (req, res) => {
    if (req.session && req.session.authenticated) {
        res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'login.html'));
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ success: false, error: 'Password is required' });
        }
        
        const hash = await storage.getPasswordHash();
        const match = await bcrypt.compare(password, hash);
        
        if (match) {
            req.session.authenticated = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login error' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

app.get('/api/admin/config', requireAuth, async (req, res) => {
    try {
        const config = await storage.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error getting admin config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

app.post('/api/admin/config', requireAuth, async (req, res) => {
    try {
        await storage.saveConfig(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/hero-image', requireAuth, upload.single('heroImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        const config = await storage.getConfig();
        
        // Delete old hero image if exists
        if (config.heroImage) {
            try {
                await storage.deleteFile(config.heroImage);
            } catch (error) {
                console.warn('Error deleting old hero image:', error);
                // Continue even if deletion fails
            }
        }

        // Upload new image
        const filename = `hero-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const imageUrl = await storage.uploadFile(
            req.file.buffer,
            filename,
            req.file.mimetype
        );

        config.heroImage = imageUrl;
        await storage.saveConfig(config);
        
        res.json({ success: true, heroImage: imageUrl });
    } catch (error) {
        console.error('Error uploading hero image:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload image' });
    }
});

app.post('/api/admin/password', requireAuth, async (req, res) => {
    try {
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }
        
        const hash = await bcrypt.hash(newPassword, 10);
        await storage.savePasswordHash(hash);
        res.json({ success: true });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/gallery', requireAuth, async (req, res) => {
    try {
        const gallery = await storage.getGallery();
        res.json(gallery);
    } catch (error) {
        console.error('Error getting admin gallery:', error);
        res.status(500).json({ error: 'Failed to load gallery' });
    }
});

app.post('/api/admin/gallery', requireAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        // Upload image to storage
        const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const imageUrl = await storage.uploadFile(
            req.file.buffer,
            filename,
            req.file.mimetype
        );

        const gallery = await storage.getGallery();
        const newItem = {
            id: Date.now().toString(),
            image: imageUrl,
            category: req.body.category || 'all',
            title: req.body.title || 'Gallery Item',
            order: gallery.length
        };

        gallery.push(newItem);
        await storage.saveGallery(gallery);
        
        res.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        
        // Handle specific error types
        if (error.message && error.message.includes('File too large')) {
            return res.status(400).json({ 
                success: false, 
                error: 'File too large. Maximum size is 10MB. Please compress your image or use a smaller file.' 
            });
        }
        
        res.status(500).json({ success: false, error: error.message || 'Failed to upload image' });
    }
});

app.delete('/api/admin/gallery/:id', requireAuth, async (req, res) => {
    try {
        const gallery = await storage.getGallery();
        const item = gallery.find(i => i.id === req.params.id);
        
        if (item && item.image) {
            // Delete the image file
            try {
                await storage.deleteFile(item.image);
            } catch (error) {
                console.warn('Error deleting image file:', error);
                // Continue even if file deletion fails
            }
        }

        const filtered = gallery.filter(i => i.id !== req.params.id);
        await storage.saveGallery(filtered);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/gallery/:id', requireAuth, async (req, res) => {
    try {
        const gallery = await storage.getGallery();
        const index = gallery.findIndex(i => i.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        gallery[index] = { ...gallery[index], ...req.body };
        await storage.saveGallery(gallery);
        
        res.json({ success: true, item: gallery[index] });
    } catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/gallery/reorder', requireAuth, async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'Items must be an array' });
        }
        
        await storage.saveGallery(items);
        res.json({ success: true });
    } catch (error) {
        console.error('Error reordering gallery:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== Booking API ====================

app.post('/api/booking', async (req, res) => {
    try {
        const { name, email, phone, date, time, service, message } = req.body;

        if (!name || !email || !phone || !date || !time || !service) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields' 
            });
        }

        const results = [];
        const config = await storage.getConfig();
        
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
        if (process.env.GOOGLE_SHEETS_CREDENTIALS && process.env.GOOGLE_SHEET_ID) {
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

// ==================== Helper Functions ====================

async function sendBookingEmail(bookingData, config) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured');
    }

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

async function logToGoogleSheets(bookingData) {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        throw new Error('Google Sheets credentials not configured');
    }

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

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler for API routes
app.use((req, res) => {
    // If it's an API route that doesn't exist, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Otherwise, let it fall through to static file serving or return 404
    res.status(404).send('Not found');
});

// Export the Express app as a serverless function for Vercel
module.exports = app;
