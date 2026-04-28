import { create } from 'zustand';

export const useChatStore = create((set) => ({
  globalMessages: [],
  teamMessages: [],
  auctioneerMessages: [],
  
  addGlobalMessage: (msg) => set((state) => ({ globalMessages: [...state.globalMessages, msg] })),
  addTeamMessage: (msg) => set((state) => ({ teamMessages: [...state.teamMessages, msg] })),
  addAuctioneerMessage: (msg) => set((state) => ({ auctioneerMessages: [...state.auctioneerMessages, msg] })),
  
  setInitialGlobal: (messages) => set({ globalMessages: messages }),
  setInitialTeam: (messages) => set({ teamMessages: messages }),
  setInitialAuctioneer: (messages) => set({ auctioneerMessages: messages })
}));
