import { create } from 'zustand';
import type { MuseBoard, SavedMuse } from '@/types';
import * as museService from '@/services/museService';

interface MuseState {
  boards: MuseBoard[];
  muses: SavedMuse[];
  activeBoardId: string | null;
  loading: boolean;
  error: string | null;

  fetchBoards: () => Promise<void>;
  fetchMuses: (boardId?: string) => Promise<void>;
  createBoard: (name: string, icon: string) => Promise<void>;
  updateBoard: (id: string, updates: { name?: string; icon?: string }) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  saveMuse: (muse: Omit<SavedMuse, 'id'>) => Promise<void>;
  updateMuse: (id: string, updates: { title?: string; notes?: string; extraImages?: string[]; tags?: string[] }) => Promise<void>;
  moveMuse: (id: string, newBoardId: string | null) => Promise<void>;
  deleteMuse: (id: string) => Promise<void>;
  setActiveBoard: (id: string | null) => void;
  clearError: () => void;
}

export const useMuseStore = create<MuseState>((set, get) => ({
  boards: [],
  muses: [],
  activeBoardId: null,
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const boards = await museService.fetchBoards();
      set({ boards, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  fetchMuses: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const muses = await museService.fetchMuses(boardId);
      set({ muses, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  createBoard: async (name, icon) => {
    set({ error: null });
    try {
      const board = await museService.createBoard(name, icon);
      set((s) => ({ boards: [board, ...s.boards] }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteBoard: async (id) => {
    set({ error: null });
    try {
      await museService.deleteBoard(id);
      const { activeBoardId } = get();
      set((s) => ({
        boards: s.boards.filter((b) => b.id !== id),
        muses: s.muses.map((m) => (m.boardId === id ? { ...m, boardId: undefined } : m)),
        activeBoardId: activeBoardId === id ? null : activeBoardId,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  saveMuse: async (muse) => {
    set({ error: null });
    try {
      const saved = await museService.saveMuse(muse);
      set((s) => ({
        muses: [saved, ...s.muses],
        boards: s.boards.map((b) =>
          b.id === muse.boardId ? { ...b, count: b.count + 1 } : b
        ),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteMuse: async (id) => {
    set({ error: null });
    try {
      const muse = get().muses.find((m) => m.id === id);
      await museService.deleteMuse(id);
      set((s) => ({
        muses: s.muses.filter((m) => m.id !== id),
        boards: s.boards.map((b) =>
          muse?.boardId && b.id === muse.boardId ? { ...b, count: Math.max(0, b.count - 1) } : b
        ),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateBoard: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await museService.updateBoard(id, updates);
      set((s) => ({
        boards: s.boards.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateMuse: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await museService.updateMuse(id, updates);
      set((s) => ({
        muses: s.muses.map((m) => (m.id === id ? updated : m)),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  moveMuse: async (id, newBoardId) => {
    set({ error: null });
    try {
      const muse = get().muses.find((m) => m.id === id);
      const oldBoardId = muse?.boardId;
      await museService.moveMuse(id, newBoardId);
      set((s) => ({
        muses: s.muses.map((m) =>
          m.id === id ? { ...m, boardId: newBoardId ?? undefined } : m
        ),
        boards: s.boards.map((b) => {
          if (oldBoardId && b.id === oldBoardId) return { ...b, count: Math.max(0, b.count - 1) };
          if (newBoardId && b.id === newBoardId) return { ...b, count: b.count + 1 };
          return b;
        }),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setActiveBoard: (id) => set({ activeBoardId: id }),
  clearError: () => set({ error: null }),
}));
