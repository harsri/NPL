/**
 * IPL 2025 Squad Rules Engine
 * Enforces composition limits, purse rules, and endgame disqualification checks.
 */

const MAX_SQUAD_SIZE = 25;
const MIN_SQUAD_SIZE = 15;
const MAX_OVERSEAS = 6;
const MIN_WICKETKEEPERS = 1;
const MIN_UNCAPPED = 1;
const MIN_BID_INCREMENT = 0.05; // 5 Lakhs (in Cr)

function canTeamBid(team, player, bidAmount) {
  const responses = { allow: true, reason: null };

  // 1. Purse Check
  if (team.purse_remaining < bidAmount) {
    return { allow: false, reason: 'Insufficient purse' };
  }

  // 2. Max Squad Limit
  if (team.acquired_players.length >= MAX_SQUAD_SIZE) {
    return { allow: false, reason: 'Squad full (Max 25)' };
  }

  // 3. Overseas Limit
  if (player.is_overseas) {
    const currentOverseas = team.acquired_players.filter(p => p.player.is_overseas).length;
    if (currentOverseas >= MAX_OVERSEAS) {
      return { allow: false, reason: `Overseas limit reached (${MAX_OVERSEAS}/${MAX_OVERSEAS})` };
    }
  }

  return responses;
}

function getValidNextBid(currentBid, basePrice) {
  if (currentBid === 0 || !currentBid) {
    return basePrice;
  }
  // Standard increment logic (can be extended to slabs if needed)
  return parseFloat((currentBid + MIN_BID_INCREMENT).toFixed(2));
}

function extractRealtimeWarnings(team) {
  const warnings = [];
  
  const currentOverseas = team.acquired_players.filter(p => p.player.is_overseas).length;
  if (currentOverseas >= MAX_OVERSEAS) {
    warnings.push({ type: 'OVERSEAS_FULL', message: 'Overseas slots full (6/6). Cannot buy more.' });
  } else if (currentOverseas === MAX_OVERSEAS - 1) {
    warnings.push({ type: 'OVERSEAS_WARNING', message: 'Only 1 overseas slot remaining.' });
  }

  const wkCount = team.acquired_players.filter(p => p.player.role === 'WICKETKEEPER').length;
  if (wkCount === 0) {
    warnings.push({ type: 'MISSING_WK', message: '⚠️ Buy a wicketkeeper to avoid disqualification' });
  }

  const uncappedCount = team.acquired_players.filter(p => p.player.is_uncapped).length;
  if (uncappedCount === 0) {
    warnings.push({ type: 'MISSING_UNCAPPED', message: '⚠️ Buy an uncapped player to avoid disqualification' });
  }

  if (team.acquired_players.length >= MAX_SQUAD_SIZE) {
    warnings.push({ type: 'SQUAD_FULL', message: 'Squad at maximum capacity (25/25).' });
  }

  return warnings;
}

function runDisqualificationCheck(team) {
  if (team.acquired_players.length < MIN_SQUAD_SIZE) {
    return { disqualified: true, reason: `Minimum ${MIN_SQUAD_SIZE} players required` };
  }

  const wkCount = team.acquired_players.filter(p => p.player.role === 'WICKETKEEPER').length;
  if (wkCount < MIN_WICKETKEEPERS) {
    return { disqualified: true, reason: `At least ${MIN_WICKETKEEPERS} wicketkeeper required` };
  }

  const uncappedCount = team.acquired_players.filter(p => p.player.is_uncapped).length;
  if (uncappedCount < MIN_UNCAPPED) {
    return { disqualified: true, reason: `At least ${MIN_UNCAPPED} uncapped player required` };
  }

  const overseasCount = team.acquired_players.filter(p => p.player.is_overseas).length;
  if (overseasCount > MAX_OVERSEAS) {
    return { disqualified: true, reason: `Exceeded overseas player limit (${MAX_OVERSEAS})` };
  }

  return { disqualified: false, reason: null };
}

function calculateSquadQualityScore(team) {
  if (team.acquired_players.length === 0) return 0;
  
  const totalStrength = team.acquired_players.reduce((sum, relation) => {
    return sum + relation.player.batting_strength + relation.player.bowling_strength;
  }, 0);

  return parseFloat((totalStrength / team.acquired_players.length).toFixed(2));
}

function evaluateRTMElegibility(player, teams) {
  // Finds if any team is eligible for RTM for the given player
  const targetTeamName = player.ipl_franchise;
  if (!targetTeamName) return null;

  const eligibleTeam = teams.find(t => 
    t.name.toLowerCase() === targetTeamName.toLowerCase() && t.rtm_cards > 0
  );

  return eligibleTeam ? eligibleTeam.id : null;
}

module.exports = {
  canTeamBid,
  getValidNextBid,
  extractRealtimeWarnings,
  runDisqualificationCheck,
  calculateSquadQualityScore,
  evaluateRTMElegibility,
  CONSTANTS: {
    MAX_SQUAD_SIZE,
    MIN_SQUAD_SIZE,
    MAX_OVERSEAS,
    MIN_WICKETKEEPERS,
    MIN_UNCAPPED,
    MIN_BID_INCREMENT
  }
};
