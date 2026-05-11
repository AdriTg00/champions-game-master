// src/store/gameStore.js
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Estado de juegos
  games: [],
  champion: null,
  left: null,
  right: null,
  bufferIndex: 0,
  
  // Estado de votación
  choiceCount: 0,
  votesMap: {},
  
  // UI estado
  loading: false,
  error: null,

  // Acciones
  setGames: (games) => set({ games }),
  
  setChampion: (champion) => set({ champion }),
  
  setLeft: (left) => set({ left }),
  
  setRight: (right) => set({ right }),
  
  setBufferIndex: (bufferIndex) => set({ bufferIndex }),
  
  setChoiceCount: (choiceCount) => set({ choiceCount }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  // Registrar voto
  recordVote: (gameId) => set((state) => {
    const newVotesMap = { ...state.votesMap };
    newVotesMap[gameId] = (newVotesMap[gameId] || 0) + 1;
    return { votesMap: newVotesMap };
  }),
  
  // Reset completo
  reset: () => set({
    champion: null,
    left: null,
    right: null,
    bufferIndex: 0,
    choiceCount: 0,
    votesMap: {},
    error: null
  }),
  
  // Obtener ranking
  getRanking: () => {
    const state = get();
    const ranking = Object.entries(state.votesMap).map(([gameId, count]) => {
      const game = state.games.find(g => (g._id || g.id) === gameId);
      return game ? { ...game, count } : null;
    }).filter(Boolean);
    
    ranking.sort((a, b) => b.count - a.count);
    return ranking;
  }
}));
