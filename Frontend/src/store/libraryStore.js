import { create } from "zustand";
import { persist } from "zustand/middleware";
import client from "../api/client";

export const STATUSES = ["playing", "backlog", "completed", "completed100", "dropped", "wishlist"];

export const STATUS_LABELS = {
  playing: "library.statusPlaying",
  backlog: "library.statusBacklog",
  completed: "library.statusCompleted",
  completed100: "library.statusCompleted100",
  dropped: "library.statusDropped",
  wishlist: "library.statusWishlist",
};

export const STATUS_COLORS = {
  playing: "oklch(0.55 0.18 145)",
  backlog: "oklch(0.6 0.12 250)",
  completed: "oklch(0.55 0.18 210)",
  completed100: "oklch(0.5 0.18 45)",
  dropped: "oklch(0.5 0.15 25)",
  wishlist: "oklch(0.55 0.18 310)",
};

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      entries: [],
      stats: null,
      loading: false,
      error: null,

      fetchEntries: async () => {
        set({ loading: true, error: null });
        try {
          const res = await client.get("/api/library");
          set({ entries: res.data.entries || [], loading: false });
        } catch {
          set({ error: true, loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const res = await client.get("/api/library/stats");
          set({ stats: res.data.stats });
        } catch {}
      },

      addEntry: async (data) => {
        try {
          const res = await client.post("/api/library", data);
          set((s) => ({ entries: [res.data.entry, ...s.entries] }));
          return true;
        } catch {
          return false;
        }
      },

      updateEntry: async (id, data) => {
        try {
          const res = await client.put(`/api/library/${id}`, data);
          set((s) => ({
            entries: s.entries.map((e) => (e._id === id ? res.data.entry : e)),
          }));
          return true;
        } catch {
          return false;
        }
      },

      deleteEntry: async (id) => {
        try {
          await client.delete(`/api/library/${id}`);
          set((s) => ({ entries: s.entries.filter((e) => e._id !== id) }));
          return true;
        } catch {
          return false;
        }
      },

      refresh: async () => {
        const state = get();
        await Promise.all([state.fetchEntries(), state.fetchStats()]);
      },
    }),
    {
      name: "library-storage",
      partialize: () => ({}),
    }
  )
);
