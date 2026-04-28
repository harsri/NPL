const redisFallback = new Map();

const redis = {
  get: async (key) => redisFallback.get(key) || null,
  set: async (key, val, ex, time) => {
    redisFallback.set(key, val);
    if (ex === 'EX') {
      setTimeout(() => redisFallback.delete(key), time * 1000);
    }
  },
  del: async (...keys) => {
    keys.forEach(key => redisFallback.delete(key));
  },
  keys: async (pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(redisFallback.keys()).filter(key => regex.test(key));
  },
  sadd: async (key, ...members) => {
    if (!redisFallback.has(key)) redisFallback.set(key, new Set());
    const s = redisFallback.get(key);
    members.forEach(m => s.add(m));
  },
  srem: async (key, ...members) => {
    const s = redisFallback.get(key);
    if (s) members.forEach(m => s.delete(m));
  },
  smembers: async (key) => {
    const s = redisFallback.get(key);
    return s ? Array.from(s) : [];
  },
  lpush: async (key, ...vals) => {
    if (!redisFallback.has(key)) redisFallback.set(key, []);
    const list = redisFallback.get(key);
    list.unshift(...vals);
  },
  ltrim: async (key, start, end) => {
    const list = redisFallback.get(key) || [];
    const realEnd = end === -1 ? list.length : end + 1;
    redisFallback.set(key, list.slice(start, realEnd));
  },
  lrange: async (key, start, end) => {
    const list = redisFallback.get(key) || [];
    const realEnd = end === -1 ? list.length : end + 1;
    return list.slice(start, realEnd);
  }
};

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
