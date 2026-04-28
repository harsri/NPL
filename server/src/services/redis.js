const Redis = require('ioredis');

// Fallback to local redis if REDIS_URL absent
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Helper functions that stringify/parse JSON automatically
async function getJson(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function setJson(key, value, expirySeconds = null) {
  const stringified = JSON.stringify(value);
  if (expirySeconds) {
    await redis.set(key, stringified, 'EX', expirySeconds);
  } else {
    await redis.set(key, stringified);
  }
}

async function delPattern(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

module.exports = {
  redis,
  getJson,
  setJson,
  delPattern
};
