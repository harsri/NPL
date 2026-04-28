/**
 * AI Bot logic for Practice Mode.
 * Since Practice mode does not use DB, this entirely runs simulating events 
 * on an isolated socket.io namespace or mock room.
 */

function setupPracticeBots(io, roomId) {
  // Simple event emulators using setTimeout
  
  const botTeams = [
    { id: 'bot1', name: '🔴 Aggressive', style: 'aggressive' },
    { id: 'bot2', name: '🟡 Conservative', style: 'conservative' },
    { id: 'bot3', name: '🟢 Balanced', style: 'balanced' },
  ];

  io.to(roomId).emit('bots:joined', { bots: botTeams });

  // Expose a function to trigger a bot evaluation loop when a bid happens or player is up
  return function evaluateBotBids(currentBid, player, basePrice) {
    botTeams.forEach(bot => {
      // Very basic mock logic
      let willBid = false;
      let bidAmount = 0;
      
      if (bot.style === 'aggressive') {
        willBid = Math.random() > 0.2;
        bidAmount = currentBid ? currentBid + 0.25 : basePrice;
      } else if (bot.style === 'conservative') {
        if ((player.batting_strength + player.bowling_strength) >= 7) {
          if (!currentBid || currentBid < basePrice * 1.5) {
             willBid = true;
             bidAmount = currentBid ? currentBid + 0.05 : basePrice;
          }
        }
      } else {
        willBid = Math.random() > 0.4;
        bidAmount = currentBid ? currentBid + (Math.random() > 0.5 ? 0.05 : 0.10) : basePrice;
      }

      if (willBid) {
        setTimeout(() => {
          io.to(roomId).emit('auction:bid_placed', { team_id: bot.id, amount: bidAmount });
        }, 2000 + Math.random() * 3000); // Random delay
      }
    });
  };
}

module.exports = setupPracticeBots;
