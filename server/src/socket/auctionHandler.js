const { PrismaClient } = require('@prisma/client');
const { getJson, setJson } = require('../services/redis');
const { validateTeamBid, getValidNextBid, evaluateRTMElegibility } = require('../services/validation');

const prisma = new PrismaClient();

function auctionHandler(io, socket, redis) {
  const { user } = socket;

  // Emit current timer every second, handling expiration
  const startTimer = async (roomId, initialSeconds) => {
    let secondsLeft = initialSeconds;
    
    // Clear existing timer interval if exists
    // (In a real app, use a dedicated worker or store interval IDs centrally per room, 
    // here we simulate via node setInterval attached to the room scope somehow,
    // but a cleaner approach is recursive setTimeout).
    
    // Storing interval id globally is tricky, let's just use redis to store the timer value 
    // and run a decentralized decrement loop (this is basic naive implementation).
    const interval = setInterval(async () => {
      secondsLeft--;
      await redis.set(`room:${roomId}:timer`, secondsLeft);
      io.to(roomId).emit('auction:timer_tick', { seconds_left: secondsLeft, percent_remaining: Math.round((secondsLeft/initialSeconds)*100) });
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
        const currentState = await getJson(`room:${roomId}:current`);
        
        if (currentState && currentState.phase === 'BIDDING') {
          // Timer expired with no accepted bids that closed the auction
          if (!currentState.leading_team_id) {
             // Unsold
             io.to(roomId).emit('auction:player_unsold', { player_id: currentState.player_id });
             currentState.phase = 'CLOSED';
             await setJson(`room:${roomId}:current`, currentState);
          }
        }
      }
    }, 1000);
  };

  socket.on('auction:player_up', async (payload) => {
    if (user.role !== 'auctioneer' && user.role !== 'co_auctioneer') return;
    
    const { roomId, player_id, timer_seconds } = payload;
    
    await setJson(`room:${roomId}:current`, {
      player_id,
      current_bid: 0,
      leading_team_id: null,
      phase: 'BIDDING'
    });
    
    await redis.set(`room:${roomId}:timer`, timer_seconds);
    io.to(roomId).emit('auction:player_up', { player_id });
    
    startTimer(roomId, timer_seconds);
  });

  socket.on('bid:place', async (payload) => {
    if (user.role !== 'manager') return;
    const { team_id, amount } = payload;
    const roomId = user.roomId;
    
    const currentState = await getJson(`room:${roomId}:current`);
    if (!currentState || currentState.phase !== 'BIDDING') return;

    // Auctioneer sees it live via emit
    io.to(roomId).emit('auction:bid_placed', { team_id, amount });
  });

  socket.on('bid:accept', async (payload) => {
    if (user.role !== 'auctioneer' && user.role !== 'co_auctioneer') return;
    
    const { roomId, team_id, amount } = payload;
    const currentState = await getJson(`room:${roomId}:current`);
    
    if (!currentState) return;
    
    currentState.leading_team_id = team_id;
    currentState.current_bid = amount;
    await setJson(`room:${roomId}:current`, currentState);
    
    io.to(roomId).emit('auction:bid_accepted', { team_id, amount });

    // RTM check
    const player = await prisma.player.findUnique({ where: { id: currentState.player_id }});
    const teams = await prisma.team.findMany({ where: { room_id: roomId }});
    
    const eligibleTeamId = evaluateRTMElegibility(player, teams);
    
    if (eligibleTeamId && eligibleTeamId !== team_id) {
      currentState.phase = 'RTM';
      await setJson(`room:${roomId}:current`, currentState);
      io.to(roomId).emit('auction:rtm_window_open', { eligible_team_id: eligibleTeamId, seconds: 15 });
    } else {
      // Direct Sale
      currentState.phase = 'CLOSED';
      await setJson(`room:${roomId}:current`, currentState);
      
      // Persist to DB directly here or wait for 'End Auction' sync
      io.to(roomId).emit('auction:sold', { team_id, amount });
    }
  });

  socket.on('bid:reject', async (payload) => {
    if (user.role !== 'auctioneer' && user.role !== 'co_auctioneer') return;
    const { roomId, team_id, reason } = payload;
    io.to(roomId).emit('auction:bid_rejected', { team_id, reason });
  });
}

module.exports = auctionHandler;
