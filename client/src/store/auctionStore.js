import { create } from 'zustand';

export const useAuctionStore = create((set) => ({
  currentPlayerId: null,
  currentBid: 0,
  leadingTeamId: null,
  timerSecondsLeft: 0,
  timerPercent: 100,
  phase: 'LOBBY', // 'LOBBY' | 'BIDDING' | 'RTM' | 'CLOSED'
  eligibleRTMTeamId: null,
  
  setPlayerUp: (playerId) => set({ currentPlayerId: playerId, currentBid: 0, leadingTeamId: null, phase: 'BIDDING', timerSecondsLeft: 0 }),
  setBidAccepted: (teamId, amount) => set({ leadingTeamId: teamId, currentBid: amount }),
  setTimer: (seconds, percent) => set({ timerSecondsLeft: seconds, timerPercent: percent }),
  setRTMWindow: (teamId) => set({ phase: 'RTM', eligibleRTMTeamId: teamId }),
  setClosed: () => set({ phase: 'CLOSED' })
}));
