// src/store/gameStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncUpload, syncDownload } from '../utils/syncData';

export const MAX_CHOICES = 30;

export const useGameStore = create(
  persist(
    (set, get) => ({
  MAX_CHOICES,
  
  games: [],
  champion: null,
  left: null,
  right: null,
  bufferIndex: 0,
  isFinished: false,
  
  choiceCount: 0,
  votesMap: {},
  
  loading: false,
  error: null,

  setGames: (games) => set({ games }),
  
  setChampion: (champion) => set({ champion }),
  
  setLeft: (left) => set({ left }),
  
  setRight: (right) => set({ right }),
  
  setBufferIndex: (bufferIndex) => set({ bufferIndex }),
  
  setChoiceCount: (choiceCount) => set({ choiceCount }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  recordVote: (gameId) => {
    const state = get();
    const newVotesMap = { ...state.votesMap };
    const newChoiceCount = state.choiceCount + 1;
    const isFinished = newChoiceCount >= state.MAX_CHOICES;
    newVotesMap[gameId] = (newVotesMap[gameId] || 0) + 1;
    set({ votesMap: newVotesMap, choiceCount: newChoiceCount, isFinished });
    syncUpload("votes", { votesMap: newVotesMap, choiceCount: newChoiceCount });
  },
  
  reset: () => {
    set({
      champion: null, left: null, right: null, bufferIndex: 0,
      isFinished: false, choiceCount: 0, votesMap: {}, error: null,
    });
    syncUpload("votes", { votesMap: {}, choiceCount: 0 });
  },
  
  getRanking: () => {
    const state = get();
    const ranking = Object.entries(state.votesMap).map(([gameId, count]) => {
      const game = state.games.find(g => (g._id || g.id) === gameId);
      return game ? { ...game, count } : null;
    }).filter(Boolean);
    ranking.sort((a, b) => b.count - a.count);
    return ranking;
  },

  syncVotesFromServer: async () => {
    const server = await syncDownload("votes");
    if (server && server.votesMap) {
      set({ votesMap: server.votesMap, choiceCount: server.choiceCount || 0 });
    }
  },
}),
  {
    name: 'game-storage',
    partialize: (state) => ({
      games: state.games,
      champion: state.champion,
      left: state.left,
      right: state.right,
      bufferIndex: state.bufferIndex,
      isFinished: state.isFinished,
      choiceCount: state.choiceCount,
      votesMap: state.votesMap,
    }),
  })
);
