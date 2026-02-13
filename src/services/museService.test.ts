import { describe, it, expect, beforeEach } from 'vitest';

import {
  fetchBoards,
  createBoard,
  deleteBoard,
  fetchMuses,
  saveMuse,
  deleteMuse,
  updateBoard,
  updateMuse,
  moveMuse,
} from './museService';

const makeMuse = (overrides = {}) => ({
  userImage: 'img.jpg',
  celebImage: 'celeb.jpg',
  celebName: 'Test Celeb',
  date: '2025-01-01',
  vibe: 'Elegant',
  aiStylePoints: ['point1'],
  tags: ['tag1'],
  notes: 'some notes',
  extraImages: [],
  ...overrides,
});

describe('museService (localStorage fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── fetchBoards ──────────────────────────────────────────

  describe('fetchBoards', () => {
    it('returns empty array initially', async () => {
      const boards = await fetchBoards();
      expect(boards).toEqual([]);
    });

    it('returns boards with correct muse count', async () => {
      const board = await createBoard('Board A', '🎨');
      await saveMuse(makeMuse({ boardId: board.id }));
      await saveMuse(makeMuse({ boardId: board.id }));
      await saveMuse(makeMuse()); // no board

      const boards = await fetchBoards();
      expect(boards).toHaveLength(1);
      expect(boards[0].count).toBe(2);
    });
  });

  // ── createBoard ──────────────────────────────────────────

  describe('createBoard', () => {
    it('creates a board with expected fields', async () => {
      const board = await createBoard('My Board', '🌟');

      expect(board).toMatchObject({
        name: 'My Board',
        icon: '🌟',
        count: 0,
        aiSummary: '',
      });
      expect(board.id).toBeDefined();
    });
  });

  // ── deleteBoard ──────────────────────────────────────────

  describe('deleteBoard', () => {
    it('removes board and unlinks associated muses', async () => {
      const board = await createBoard('To Delete', '🗑️');
      const muse = await saveMuse(makeMuse({ boardId: board.id }));

      await deleteBoard(board.id);

      const boards = await fetchBoards();
      expect(boards).toHaveLength(0);

      const muses = await fetchMuses();
      expect(muses).toHaveLength(1);
      expect(muses[0].id).toBe(muse.id);
      expect(muses[0].boardId).toBeUndefined();
    });
  });

  // ── fetchMuses ───────────────────────────────────────────

  describe('fetchMuses', () => {
    it('returns all muses when no boardId is given', async () => {
      await saveMuse(makeMuse());
      await saveMuse(makeMuse());

      const muses = await fetchMuses();
      expect(muses).toHaveLength(2);
    });

    it('filters muses by boardId', async () => {
      const board = await createBoard('Filter Board', '📋');
      await saveMuse(makeMuse({ boardId: board.id }));
      await saveMuse(makeMuse()); // no board

      const filtered = await fetchMuses(board.id);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].boardId).toBe(board.id);
    });
  });

  // ── saveMuse ─────────────────────────────────────────────

  describe('saveMuse', () => {
    it('saves a muse and returns it with an id', async () => {
      const muse = await saveMuse(makeMuse({ celebName: 'Celeb X' }));

      expect(muse.id).toBeDefined();
      expect(muse.celebName).toBe('Celeb X');

      const all = await fetchMuses();
      expect(all).toHaveLength(1);
    });
  });

  // ── deleteMuse ───────────────────────────────────────────

  describe('deleteMuse', () => {
    it('removes a muse from localStorage', async () => {
      const muse = await saveMuse(makeMuse());
      await deleteMuse(muse.id);

      const all = await fetchMuses();
      expect(all).toHaveLength(0);
    });
  });

  // ── updateBoard ──────────────────────────────────────────

  describe('updateBoard', () => {
    it('updates board name and icon', async () => {
      const board = await createBoard('Old Name', '🎨');
      const updated = await updateBoard(board.id, { name: 'New Name', icon: '✨' });

      expect(updated.name).toBe('New Name');
      expect(updated.icon).toBe('✨');
    });

    it('throws for non-existent board id', async () => {
      await expect(updateBoard('nonexistent', { name: 'Nope' })).rejects.toThrow('Board not found');
    });
  });

  // ── updateMuse ───────────────────────────────────────────

  describe('updateMuse', () => {
    it('updates muse notes, tags, and extraImages', async () => {
      const muse = await saveMuse(makeMuse());
      const updated = await updateMuse(muse.id, {
        notes: 'updated notes',
        tags: ['new-tag'],
        extraImages: ['extra.jpg'],
      });

      expect(updated.notes).toBe('updated notes');
      expect(updated.tags).toEqual(['new-tag']);
      expect(updated.extraImages).toEqual(['extra.jpg']);
    });

    it('throws for non-existent muse id', async () => {
      await expect(updateMuse('nonexistent', { notes: 'fail' })).rejects.toThrow('Muse not found');
    });
  });

  // ── moveMuse ─────────────────────────────────────────────

  describe('moveMuse', () => {
    it('changes muse boardId', async () => {
      const boardA = await createBoard('Board A', '🅰️');
      const boardB = await createBoard('Board B', '🅱️');
      const muse = await saveMuse(makeMuse({ boardId: boardA.id }));

      await moveMuse(muse.id, boardB.id);

      const muses = await fetchMuses(boardB.id);
      expect(muses).toHaveLength(1);
      expect(muses[0].id).toBe(muse.id);
    });

    it('throws for non-existent muse id', async () => {
      await expect(moveMuse('nonexistent', 'some-board')).rejects.toThrow('Muse not found');
    });
  });
});
