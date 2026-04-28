import { create } from 'zustand';

export const useTeamStore = create((set) => ({
  myTeam: null, // the structural team object
  squad: [],    // list of acquired players
  purseRemaining: 0,
  rtmCards: 0,
  warnings: [], // objects { type, message }
  
  votes: { bid: 0, skip: 0, total: 0 },
  myDecision: null, // local specific cast
  groupDecision: null, // final resolved decision for UI display
  
  setTeamInfo: (team) => set({ myTeam: team, purseRemaining: team.purse_remaining, rtmCards: team.rtm_cards }),
  updateSquad: (player) => set((state) => ({ squad: [...state.squad, player] })),
  setWarnings: (warnings) => set({ warnings }),
  updateVotes: (bid, skip, total) => set({ votes: { bid, skip, total } }),
  resolveGroupDecision: (decision) => set({ groupDecision: decision }),
  clearVotes: () => set({ votes: { bid: 0, skip: 0, total: 0 }, myDecision: null, groupDecision: null })
}));
