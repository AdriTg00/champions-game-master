// src/store/gameStore.js
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Estado de juegos
  MAX_CHOICES: 25, // Definimos el número máximo de elecciones aquí
  
  games: [],
  champion: null,
  left: null,
  right: null,
  bufferIndex: 0,
  isFinished: false,
  
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
    const newChoiceCount = state.choiceCount + 1;
    const isFinished = newChoiceCount >= state.MAX_CHOICES;
    newVotesMap[gameId] = (newVotesMap[gameId] || 0) + 1;
    return {
      votesMap: newVotesMap,
      choiceCount: newChoiceCount,
      isFinished
    };
  }),
  
  // Reset completo
  reset: () => set({
    champion: null,
    left: null,
    right: null,
    bufferIndex: 0,
    isFinished: false,
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
