const { getJson, setJson } = require('../services/redis');

function voteHandler(io, socket, redis) {
  const { user } = socket;

  socket.on('vote:cast', async (payload) => {
    if (user.role !== 'manager' || !user.teamId) return;

    const { teamId, choice } = payload; // choice: 'bid' | 'skip'
    const roomId = user.roomId;
    
    const voteKey = `room:${roomId}:votes:${teamId}`;
    let votes = await getJson(voteKey);
    
    if (!votes) {
      votes = { bid: 0, skip: 0, total: 0, captain_vote: null, lock: false };
    }

    votes[choice]++;
    votes.total++;
    
    // In actual implementation, match this user against TeamMember to check if captain
    // For now we'll assume the payload knows
    if (payload.isCaptain) {
      votes.captain_vote = choice;
    }

    // Logic: 3/4 majority, or 50% timer elapsed tie-breaker...
    // Naive lock implementation
    const majority = Math.floor(4 / 2) + 1; // Assuming max 4
    if (votes.bid >= majority || votes.skip >= majority) {
      votes.lock = true;
      const decision = votes.bid > votes.skip ? 'bid' : 'skip';
      io.to(`team:${teamId}`).emit('vote:result', { decision });
    } else {
      io.to(`team:${teamId}`).emit('vote:update', { bid: votes.bid, skip: votes.skip, total: votes.total });
    }

    await setJson(voteKey, votes);
  });
}

module.exports = voteHandler;
