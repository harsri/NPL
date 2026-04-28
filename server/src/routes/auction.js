const express = require('express');
const router = express.Router();

// In-memory auction state (shared across all clients)
let auctionState = {
  status: 'WAITING', // WAITING | BIDDING
  activePlayer: null,
  currentBid: 0,
  leadingTeamId: null,
  timerStart: null,
  timerDuration: 30,
  soldPlayerIds: [],
  announcement: null, // e.g. "Going once... Going twice..."
  teams: [
    { id: 'team1', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0', purse: 120, squad: [] },
    { id: 'team2', name: 'Chennai Super Kings', shortName: 'CSK', color: '#F9CD05', purse: 120, squad: [] },
    { id: 'team3', name: 'Royal Challengers', shortName: 'RCB', color: '#D61C1C', purse: 120, squad: [] },
    { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D', purse: 120, squad: [] },
  ],
  log: []
};

// Get current auction state
router.get('/state', (req, res) => {
  let timerRemaining = 0;
  if (auctionState.status === 'BIDDING' && auctionState.timerStart) {
    const elapsed = (Date.now() - auctionState.timerStart) / 1000;
    timerRemaining = Math.max(0, auctionState.timerDuration - elapsed);
    // Do NOT auto-resolve on timer expiry — let auctioneer decide
  }
  res.json({ ...auctionState, timerRemaining: Math.round(timerRemaining) });
});

// Auctioneer: Put player on the block
router.post('/put-on-block', (req, res) => {
  const { player } = req.body;
  if (!player) return res.status(400).json({ error: 'Player data required' });
  if (auctionState.status === 'BIDDING') return res.status(400).json({ error: 'Another player is already on the block' });

  auctionState.status = 'BIDDING';
  auctionState.activePlayer = player;
  auctionState.currentBid = player.base_price;
  auctionState.leadingTeamId = null;
  auctionState.timerStart = Date.now();
  auctionState.timerDuration = 30;
  auctionState.announcement = null;
  auctionState.log.unshift({ msg: `🏏 ${player.name} is on the block! Base: ₹${player.base_price} Cr`, time: new Date().toLocaleTimeString() });

  res.json({ success: true });
});

// Team: Place a bid
router.post('/bid', (req, res) => {
  const { teamId } = req.body;
  if (auctionState.status !== 'BIDDING') return res.status(400).json({ error: 'No active bidding' });

  const team = auctionState.teams.find(t => t.id === teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (teamId === auctionState.leadingTeamId) return res.status(400).json({ error: 'You are already the leading bidder' });

  const increment = auctionState.currentBid < 5 ? 0.25 : 0.5;
  const newBid = +(auctionState.currentBid + increment).toFixed(2);

  if (newBid > team.purse) return res.status(400).json({ error: `Insufficient purse. Need ₹${newBid} Cr but only ₹${team.purse} Cr left` });

  auctionState.currentBid = newBid;
  auctionState.leadingTeamId = teamId;
  auctionState.timerStart = Date.now();
  auctionState.timerDuration = 15;
  auctionState.announcement = null; // Clear any "going once" message
  auctionState.log.unshift({ msg: `💰 ${team.name} bids ₹${newBid.toFixed(2)} Cr`, time: new Date().toLocaleTimeString() });

  res.json({ success: true, currentBid: newBid });
});

// Auctioneer: Ask for more bids (resets timer, broadcasts warning)
router.post('/ask-more-bids', (req, res) => {
  if (auctionState.status !== 'BIDDING') return res.status(400).json({ error: 'No active bidding' });

  auctionState.timerStart = Date.now();
  auctionState.timerDuration = 15;
  auctionState.announcement = '📢 Any further bids? Going once... Going twice...';
  auctionState.log.unshift({ msg: '📢 Auctioneer: Any further bids?', time: new Date().toLocaleTimeString() });

  res.json({ success: true });
});

// Auctioneer: Accept bid (SOLD)
router.post('/accept', (req, res) => {
  if (auctionState.status !== 'BIDDING') return res.status(400).json({ error: 'No active bidding' });
  if (!auctionState.leadingTeamId) return res.status(400).json({ error: 'No bids to accept' });

  const team = auctionState.teams.find(t => t.id === auctionState.leadingTeamId);
  team.purse = +(team.purse - auctionState.currentBid).toFixed(2);
  team.squad.push({ ...auctionState.activePlayer, soldPrice: auctionState.currentBid });
  auctionState.soldPlayerIds.push(auctionState.activePlayer.id);
  auctionState.log.unshift({ msg: `✅ SOLD! ${auctionState.activePlayer.name} → ${team.name} for ₹${auctionState.currentBid.toFixed(2)} Cr`, time: new Date().toLocaleTimeString() });

  auctionState.status = 'WAITING';
  auctionState.activePlayer = null;
  auctionState.currentBid = 0;
  auctionState.leadingTeamId = null;
  auctionState.timerStart = null;
  auctionState.announcement = null;

  res.json({ success: true });
});

// Auctioneer: Mark unsold
router.post('/unsold', (req, res) => {
  if (auctionState.status !== 'BIDDING') return res.status(400).json({ error: 'No active bidding' });

  auctionState.log.unshift({ msg: `❎ ${auctionState.activePlayer.name} — UNSOLD`, time: new Date().toLocaleTimeString() });
  auctionState.status = 'WAITING';
  auctionState.activePlayer = null;
  auctionState.currentBid = 0;
  auctionState.leadingTeamId = null;
  auctionState.timerStart = null;
  auctionState.announcement = null;

  res.json({ success: true });
});

// Reset auction
router.post('/reset', (req, res) => {
  auctionState = {
    status: 'WAITING', activePlayer: null, currentBid: 0, leadingTeamId: null,
    timerStart: null, timerDuration: 30, soldPlayerIds: [], announcement: null,
    teams: [
      { id: 'team1', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0', purse: 120, squad: [] },
      { id: 'team2', name: 'Chennai Super Kings', shortName: 'CSK', color: '#F9CD05', purse: 120, squad: [] },
      { id: 'team3', name: 'Royal Challengers', shortName: 'RCB', color: '#D61C1C', purse: 120, squad: [] },
      { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D', purse: 120, squad: [] },
    ],
    log: []
  };
  res.json({ success: true });
});

module.exports = router;
