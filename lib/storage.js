/**
 * Storage abstraction layer
 * Works with filesystem locally and Vercel KV/Blob in production
 */

const fs = require('fs-extra');
const path = require('path');

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

let kvClient = null;
let blobClient = null;

// Lazy initialization to prevent function crashes
function initializeVercelServices() {
    // Only initialize once
    if (kvClient !== null || blobClient !== null) {
        return;
    }

    if (isVercel) {
        // Initialize KV
        try {
            const { kv } = require('@vercel/kv');
            if (kv) {
                kvClient = kv;
            }
        } catch (error) {
            // Silently fail - will use filesystem fallback
            console.warn('Vercel KV not available, will use filesystem fallback');
        }

        // Initialize Blob
        try {
            const { put, del } = require('@vercel/blob');
            if (put && del) {
                blobClient = { put, del };
            }
        } catch (error) {
            // Silently fail - will use filesystem fallback
            console.warn('Vercel Blob not available, will use filesystem fallback');
        }
    }
}

// Local filesystem paths
const dataDir = path.join(process.cwd(), 'data');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist (for local development only)
if (!isVercel) {
    try {
        fs.ensureDirSync(dataDir);
        fs.ensureDirSync(uploadsDir);
    } catch (error) {
        // Ignore errors - directories might already exist
    }
}

// Default config
const defaultConfig = {
    businessName: 'Beauty Studio',
    email: 'contact@beautystudio.com',
    phone: '+1 (555) 123-4567',
    location: 'Your City, State',
    instagram: 'https://instagram.com/beautystudio',
    heroImage: ''
};

// ==================== Config Storage ====================

async function getConfig() {
    initializeVercelServices();
    
    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            const config = await kvClient.get('config');
            if (config) {
                return { ...defaultConfig, ...config };
            }
        } catch (error) {
            console.error('Error reading config from KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const configPath = path.join(dataDir, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { ...defaultConfig, ...config };
        }
    } catch (error) {
        console.error('Error reading config from filesystem:', error.message);
    }
    
    return defaultConfig;
}

async function saveConfig(config) {
    initializeVercelServices();
    
    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            await kvClient.set('config', config);
            return;
        } catch (error) {
            console.error('Error saving config to KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const configPath = path.join(dataDir, 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving config to filesystem:', error.message);
        throw error;
    }
}

// ==================== Gallery Storage ====================

async function getGallery() {
    initializeVercelServices();
    
    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            const gallery = await kvClient.get('gallery');
            if (gallery && Array.isArray(gallery)) {
                return gallery;
            }
        } catch (error) {
            console.error('Error reading gallery from KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const galleryPath = path.join(dataDir, 'gallery.json');
        if (fs.existsSync(galleryPath)) {
            const gallery = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
            return Array.isArray(gallery) ? gallery : [];
        }
    } catch (error) {
        console.error('Error reading gallery from filesystem:', error.message);
    }
    
    return [];
}

async function saveGallery(gallery) {
    initializeVercelServices();
    
    if (!Array.isArray(gallery)) {
        throw new Error('Gallery must be an array');
    }

    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            await kvClient.set('gallery', gallery);
            return;
        } catch (error) {
            console.error('Error saving gallery to KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const galleryPath = path.join(dataDir, 'gallery.json');
        fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
    } catch (error) {
        console.error('Error saving gallery to filesystem:', error.message);
        throw error;
    }
}

// ==================== Password Storage ====================

async function getPasswordHash() {
    initializeVercelServices();
    const bcrypt = require('bcrypt');
    
    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            const hash = await kvClient.get('password_hash');
            if (hash) {
                return hash;
            }
        } catch (error) {
            console.error('Error reading password from KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const passwordPath = path.join(dataDir, 'password.json');
        if (fs.existsSync(passwordPath)) {
            const data = JSON.parse(fs.readFileSync(passwordPath, 'utf8'));
            if (data.hash) {
                return data.hash;
            }
        }
    } catch (error) {
        console.error('Error reading password from filesystem:', error.message);
    }
    
    // Default password: "admin123" - CHANGE THIS!
    const defaultHash = bcrypt.hashSync('admin123', 10);
    
    // Save default hash
    try {
        await savePasswordHash(defaultHash);
    } catch (error) {
        console.error('Error saving default password:', error.message);
    }
    
    return defaultHash;
}

async function savePasswordHash(hash) {
    initializeVercelServices();
    
    if (!hash) {
        throw new Error('Password hash is required');
    }

    // Try Vercel KV first
    if (isVercel && kvClient) {
        try {
            await kvClient.set('password_hash', hash);
            return;
        } catch (error) {
            console.error('Error saving password to KV:', error.message);
        }
    }
    
    // Fallback to filesystem
    try {
        const passwordPath = path.join(dataDir, 'password.json');
        fs.writeFileSync(passwordPath, JSON.stringify({ hash }, null, 2));
    } catch (error) {
        console.error('Error saving password to filesystem:', error.message);
        throw error;
    }
}

// ==================== File Upload Storage ====================

async function uploadFile(fileBuffer, filename, contentType) {
    initializeVercelServices();
    
    if (!fileBuffer || !filename) {
        throw new Error('File buffer and filename are required');
    }

    // Try Vercel Blob first
    if (isVercel && blobClient && blobClient.put) {
        try {
            const blob = await blobClient.put(filename, fileBuffer, {
                access: 'public',
                contentType: contentType || 'image/jpeg'
            });
            return blob.url;
        } catch (error) {
            console.error('Error uploading to Blob:', error.message);
            // Fall through to filesystem fallback
        }
    }
    
    // Fallback to filesystem (local development)
    try {
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, fileBuffer);
        return `/uploads/${filename}`;
    } catch (error) {
        console.error('Error saving file to filesystem:', error.message);
        throw new Error('Failed to upload file');
    }
}

async function deleteFile(fileUrl) {
    initializeVercelServices();
    
    if (!fileUrl) {
        return; // Nothing to delete
    }
    
    // If it's a blob URL (starts with https://)
    if (fileUrl.startsWith('https://') && isVercel && blobClient && blobClient.del) {
        try {
            // Extract blob key from URL
            const urlParts = fileUrl.split('/');
            const blobKey = urlParts[urlParts.length - 1].split('?')[0];
            await blobClient.del(blobKey);
            return;
        } catch (error) {
            // Don't throw - file might not exist
            console.warn('Error deleting from Blob:', error.message);
        }
    }
    
    // Fallback to filesystem (local paths like /uploads/filename.jpg)
    try {
        const filename = path.basename(fileUrl.split('?')[0]);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        // Don't throw - file might not exist
        console.warn('Error deleting file from filesystem:', error.message);
    }
}

module.exports = {
    getConfig,
    saveConfig,
    getGallery,
    saveGallery,
    getPasswordHash,
    savePasswordHash,
    uploadFile,
    deleteFile,
    isVercel
};
