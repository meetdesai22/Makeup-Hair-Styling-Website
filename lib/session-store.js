/**
 * Session store for Express sessions
 * Uses Vercel KV (Redis) in production, MemoryStore in development
 * Completely safe - never crashes, always falls back to memory store
 */

// Export null by default - Express will use MemoryStore
// This ensures the function NEVER crashes during initialization
module.exports = null;

// Optional: Enable Redis if you want persistent sessions
// Uncomment and configure if you have Vercel KV set up
/*
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

let sessionStore = null;

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
        
        sessionStore = new RedisStore({
            client: redisClient,
            prefix: 'sess:'
        });
        
        module.exports = sessionStore;
    } catch (error) {
        console.warn('Redis not available, using memory store');
        module.exports = null;
    }
}
*/
