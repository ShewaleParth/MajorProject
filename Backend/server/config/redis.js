const { Redis } = require('@upstash/redis');

// Create Upstash Redis client (REST API - works everywhere)
let redis;
let isRedisConnected = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Test connection
    redis.ping().then(() => {
      console.log('✅ Upstash Redis connected successfully (REST API)');
      isRedisConnected = true;
    }).catch(err => {
      console.error('⚠️  Upstash Redis connection error:', err.message);
      console.log('💡 Server will continue without Redis');
      isRedisConnected = false;
    });
  } else {
    console.log('⚠️  Redis credentials not found in .env');
    console.log('💡 Server will continue without Redis (reports will work but slower)');
  }
} catch (error) {
  console.log('⚠️  Redis not available:', error.message);
  console.log('💡 Server will continue without Redis');
}

// Cache helper functions with fallback
const cache = {
  async get(key) {
    if (!isRedisConnected || !redis) return null;
    try {
      const data = await redis.get(key);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },
  
  async set(key, value, ttl = 900) {
    if (!isRedisConnected || !redis) return false;
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },
  
  async del(key) {
    if (!isRedisConnected || !redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },
  
  async exists(key) {
    if (!isRedisConnected || !redis) return false;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  },
  
  async deletePattern(pattern) {
    if (!isRedisConnected || !redis) return 0;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return 0;
    }
  },
  
  async incr(key) {
    if (!isRedisConnected || !redis) return 0;
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error.message);
      return 0;
    }
  },
  
  async expire(key, seconds) {
    if (!isRedisConnected || !redis) return false;
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error.message);
      return false;
    }
  },
  
  async ping() {
    if (!isRedisConnected || !redis) return false;
    try {
      await redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
};

module.exports = { redis, cache, isRedisConnected };
