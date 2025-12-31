/**
 * Session store for Express sessions
 * Uses Vercel KV (Redis) in production, MemoryStore in development
 * Safe initialization to prevent function crashes
 */

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

let sessionStore = null;

// Only try to use Redis if on Vercel and credentials are available
// Use try-catch to prevent function crashes
try {
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
            
            // Don't connect synchronously - let it connect on first use
            // This prevents function crashes during initialization
            
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
} catch (error) {
    console.warn('Failed to initialize session store, using memory store:', error.message);
    sessionStore = null; // Will use default memory store
}

// Export null to use default memory store if Redis not available
// Express will use MemoryStore by default when store is undefined/null
module.exports = sessionStore;
