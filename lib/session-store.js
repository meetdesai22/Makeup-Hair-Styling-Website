/**
 * Session store for Express sessions
 * Uses Vercel KV (Redis) in production, MemoryStore in development
 */

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

let sessionStore = null;

// Only try to use Redis if on Vercel and credentials are available
if (isVercel && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
        const RedisStore = require('connect-redis').default;
        const { createClient } = require('redis');
        
        const redisClient = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });
        
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        
        // Connect to Redis
        redisClient.connect().catch((err) => {
            console.error('Failed to connect to Redis:', err);
        });
        
        sessionStore = new RedisStore({
            client: redisClient,
            prefix: 'sess:'
        });
        
        console.log('Redis session store initialized');
    } catch (error) {
        console.warn('Redis session store not available, using memory store:', error.message);
        sessionStore = null; // Will use default memory store
    }
}

// For local development or if Redis is not available, use memory store
// (which is the default when store is undefined)
module.exports = sessionStore;
