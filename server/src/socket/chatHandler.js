const { getJson, setJson } = require('../services/redis');

// Max messages per channel to avoid memory leaks
const MAX_CHAT_HISTORY = 200;

function chatHandler(io, socket, redis) {
  const { user } = socket;

  socket.on('chat:send', async (payload) => {
    // scope: 'global' | 'team' | 'auctioneer'
    const { scope, message } = payload;
    const roomId = user.roomId;
    let channelKey = '';
    let emitTarget = '';

    if (scope === 'global') {
      channelKey = `room:${roomId}:chat:global`;
      emitTarget = roomId;
    } else if (scope === 'team') {
      if (!user.teamId) return;
      channelKey = `room:${roomId}:chat:team:${user.teamId}`;
      emitTarget = `team:${user.teamId}`;
    } else if (scope === 'auctioneer') {
      if (!user.teamId && user.role !== 'auctioneer') return;
      const targetTeam = payload.targetTeamId || user.teamId; 
      channelKey = `room:${roomId}:chat:auctioneer:${targetTeam}`;
      
      // Emit strictly to the auctioneers and the specific team
      // For simplicity, we just broadcast this to a unique socket room
      emitTarget = `auctioneer_thread:${targetTeam}`; 
      socket.join(emitTarget); // assure sender is in it
    }

    if (!channelKey) return;

    const chatMsg = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: user.username || user.guestName,
      senderRole: user.role,
      message,
      timestamp: new Date().toISOString()
    };

    let history = await getJson(channelKey) || [];
    history.push(chatMsg);
    
    if (history.length > MAX_CHAT_HISTORY) {
      history.shift();
    }

    await setJson(channelKey, history);
    io.to(emitTarget).emit('chat:new_message', chatMsg);
  });
}

module.exports = chatHandler;
