const jwt = require('jsonwebtoken');
const auctionHandler = require('./auctionHandler');
const voteHandler = require('./voteHandler');
const chatHandler = require('./chatHandler');
const { redis } = require('../services/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'npl_super_secret_123';

function setupSocketHandlers(io) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token'));
      socket.user = decoded; // { userId, role, roomId (for guests) }
      next();
    });
  });

  io.on('connection', async (socket) => {
    const { user } = socket;
    
    // Join room scopes
    const roomId = socket.handshake.query.roomId;
    if (roomId) {
      socket.join(roomId); // Global room channel
      
      if (user.role === 'manager' && user.teamId) {
         socket.join(`team:${user.teamId}`); // Private team channel
      }

      // Presence tracking
      await redis.sadd(`room:${roomId}:online`, user.userId || user.guestId);
      const onlineUsers = await redis.smembers(`room:${roomId}:online`);
      io.to(roomId).emit('presence:update', { users_online: onlineUsers });
    }

    // Handlers mapped to their specific domains
    auctionHandler(io, socket, redis);
    voteHandler(io, socket, redis);
    chatHandler(io, socket, redis);

    socket.on('disconnect', async () => {
      if (roomId) {
        // Disconnect grace period could go here
        await redis.srem(`room:${roomId}:online`, user.userId || user.guestId);
        const onlineUsers = await redis.smembers(`room:${roomId}:online`);
        io.to(roomId).emit('presence:update', { users_online: onlineUsers });
      }
    });
  });
}

module.exports = setupSocketHandlers;
