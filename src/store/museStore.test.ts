import { useMuseStore } from './museStore';
import type { MuseBoard, SavedMuse } from '@/types';

// Mock museService
const mockFetchBoards = vi.fn();
const mockFetchMuses = vi.fn();
const mockCreateBoard = vi.fn();
const mockUpdateBoard = vi.fn();
const mockDeleteBoard = vi.fn();
const mockSaveMuse = vi.fn();
const mockUpdateMuse = vi.fn();
const mockMoveMuse = vi.fn();
const mockDeleteMuse = vi.fn();

vi.mock('@/services/museService', () => ({
  fetchBoards: (...args: unknown[]) => mockFetchBoards(...args),
  fetchMuses: (...args: unknown[]) => mockFetchMuses(...args),
  createBoard: (...args: unknown[]) => mockCreateBoard(...args),
  updateBoard: (...args: unknown[]) => mockUpdateBoard(...args),
  deleteBoard: (...args: unknown[]) => mockDeleteBoard(...args),
  saveMuse: (...args: unknown[]) => mockSaveMuse(...args),
  updateMuse: (...args: unknown[]) => mockUpdateMuse(...args),
  moveMuse: (...args: unknown[]) => mockMoveMuse(...args),
  deleteMuse: (...args: unknown[]) => mockDeleteMuse(...args),
}));

const testBoard: MuseBoard = { id: 'b1', name: 'Board 1', icon: '🎨', count: 0, aiSummary: '' };
const testBoard2: MuseBoard = { id: 'b2', name: 'Board 2', icon: '✨', count: 2, aiSummary: '' };

const testMuse: SavedMuse = {
  id: 'm1', type: 'analysis', image: 'img1', userImage: 'img1', celebImage: 'img2', celebName: 'Jennie',
  date: '2025-01-01', vibe: 'cool', boardId: 'b1',
  aiStylePoints: ['point1'], tags: ['tag1'], notes: '', extraImages: [],
};

const testMuse2: SavedMuse = {
  id: 'm2', type: 'analysis', image: 'img3', userImage: 'img3', celebImage: 'img4', celebName: 'Jisoo',
  date: '2025-01-02', vibe: 'elegant', boardId: 'b2',
  aiStylePoints: ['point2'], tags: ['tag2'], notes: '', extraImages: [],
};

const initialState = {
  boards: [],
  muses: [],
  activeBoardId: null,
  loading: false,
  error: null,
};

describe('museStore', () => {
  beforeEach(() => {
    useMuseStore.setState(initialState);
    vi.clearAllMocks();
  });

  describe('fetchBoards', () => {
    it('sets boards on success', async () => {
      mockFetchBoards.mockResolvedValue([testBoard, testBoard2]);

      await useMuseStore.getState().fetchBoards();

      expect(useMuseStore.getState().boards).toEqual([testBoard, testBoard2]);
      expect(useMuseStore.getState().loading).toBe(false);
      expect(useMuseStore.getState().error).toBeNull();
    });

    it('sets loading to true while fetching', async () => {
      let resolvePromise: (value: MuseBoard[]) => void;
      mockFetchBoards.mockReturnValue(new Promise((r) => { resolvePromise = r; }));

      const promise = useMuseStore.getState().fetchBoards();
      expect(useMuseStore.getState().loading).toBe(true);

      resolvePromise!([]);
      await promise;
      expect(useMuseStore.getState().loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockFetchBoards.mockRejectedValue(new Error('Network error'));

      await useMuseStore.getState().fetchBoards();

      expect(useMuseStore.getState().error).toBe('Network error');
      expect(useMuseStore.getState().loading).toBe(false);
    });
  });

  describe('fetchMuses', () => {
    it('fetches all muses without boardId', async () => {
      mockFetchMuses.mockResolvedValue([testMuse, testMuse2]);

      await useMuseStore.getState().fetchMuses();

      expect(mockFetchMuses).toHaveBeenCalledWith(undefined);
      expect(useMuseStore.getState().muses).toEqual([testMuse, testMuse2]);
    });

    it('fetches muses by boardId', async () => {
      mockFetchMuses.mockResolvedValue([testMuse]);

      await useMuseStore.getState().fetchMuses('b1');

      expect(mockFetchMuses).toHaveBeenCalledWith('b1');
      expect(useMuseStore.getState().muses).toEqual([testMuse]);
    });

    it('sets error on failure', async () => {
      mockFetchMuses.mockRejectedValue(new Error('Fetch failed'));

      await useMuseStore.getState().fetchMuses();

      expect(useMuseStore.getState().error).toBe('Fetch failed');
      expect(useMuseStore.getState().loading).toBe(false);
    });
  });

  describe('createBoard', () => {
    it('adds board to beginning of list', async () => {
      useMuseStore.setState({ boards: [testBoard2] });
      const newBoard: MuseBoard = { id: 'b3', name: 'New Board', icon: '🔥', count: 0, aiSummary: '' };
      mockCreateBoard.mockResolvedValue(newBoard);

      await useMuseStore.getState().createBoard('New Board', '🔥');

      const { boards } = useMuseStore.getState();
      expect(boards).toHaveLength(2);
      expect(boards[0]).toEqual(newBoard);
      expect(boards[1]).toEqual(testBoard2);
    });

    it('sets error on failure', async () => {
      mockCreateBoard.mockRejectedValue(new Error('Create failed'));

      await useMuseStore.getState().createBoard('Fail', '❌');

      expect(useMuseStore.getState().error).toBe('Create failed');
    });
  });

  describe('updateBoard', () => {
    it('updates board in list', async () => {
      useMuseStore.setState({ boards: [testBoard, testBoard2] });
      const updated = { ...testBoard, name: 'Renamed Board' };
      mockUpdateBoard.mockResolvedValue(updated);

      await useMuseStore.getState().updateBoard('b1', { name: 'Renamed Board' });

      expect(useMuseStore.getState().boards[0]!.name).toBe('Renamed Board');
      expect(useMuseStore.getState().boards[1]).toEqual(testBoard2);
    });

    it('sets error on failure', async () => {
      mockUpdateBoard.mockRejectedValue(new Error('Update failed'));

      await useMuseStore.getState().updateBoard('b1', { name: 'Fail' });

      expect(useMuseStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteBoard', () => {
    it('removes board from list', async () => {
      useMuseStore.setState({ boards: [testBoard, testBoard2] });
      mockDeleteBoard.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteBoard('b1');

      expect(useMuseStore.getState().boards).toEqual([testBoard2]);
    });

    it('resets activeBoardId if matching deleted board', async () => {
      useMuseStore.setState({ boards: [testBoard], activeBoardId: 'b1' });
      mockDeleteBoard.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteBoard('b1');

      expect(useMuseStore.getState().activeBoardId).toBeNull();
    });

    it('keeps activeBoardId if not matching deleted board', async () => {
      useMuseStore.setState({ boards: [testBoard, testBoard2], activeBoardId: 'b2' });
      mockDeleteBoard.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteBoard('b1');

      expect(useMuseStore.getState().activeBoardId).toBe('b2');
    });

    it('unlinks muses from deleted board', async () => {
      useMuseStore.setState({ boards: [testBoard], muses: [testMuse, testMuse2] });
      mockDeleteBoard.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteBoard('b1');

      const muses = useMuseStore.getState().muses;
      expect(muses[0]!.boardId).toBeUndefined();
      expect(muses[1]!.boardId).toBe('b2');
    });

    it('sets error on failure', async () => {
      mockDeleteBoard.mockRejectedValue(new Error('Delete failed'));

      await useMuseStore.getState().deleteBoard('b1');

      expect(useMuseStore.getState().error).toBe('Delete failed');
    });
  });

  describe('saveMuse', () => {
    it('adds muse to beginning of list', async () => {
      useMuseStore.setState({ boards: [testBoard], muses: [testMuse2] });
      const newMuse = { ...testMuse, id: 'm3' };
      mockSaveMuse.mockResolvedValue(newMuse);

      const { id: _, ...museWithoutId } = testMuse;
      await useMuseStore.getState().saveMuse(museWithoutId);

      const { muses } = useMuseStore.getState();
      expect(muses).toHaveLength(2);
      expect(muses[0]!.id).toBe('m3');
    });

    it('increments board count', async () => {
      useMuseStore.setState({ boards: [{ ...testBoard, count: 0 }], muses: [] });
      mockSaveMuse.mockResolvedValue(testMuse);

      const { id: _, ...museWithoutId } = testMuse;
      await useMuseStore.getState().saveMuse(museWithoutId);

      expect(useMuseStore.getState().boards[0]!.count).toBe(1);
    });

    it('sets error on failure', async () => {
      mockSaveMuse.mockRejectedValue(new Error('Save failed'));

      const { id: _, ...museWithoutId } = testMuse;
      await useMuseStore.getState().saveMuse(museWithoutId);

      expect(useMuseStore.getState().error).toBe('Save failed');
    });
  });

  describe('updateMuse', () => {
    it('updates muse in list', async () => {
      useMuseStore.setState({ muses: [testMuse, testMuse2] });
      const updated = { ...testMuse, notes: 'Updated notes' };
      mockUpdateMuse.mockResolvedValue(updated);

      await useMuseStore.getState().updateMuse('m1', { notes: 'Updated notes' });

      expect(useMuseStore.getState().muses[0]!.notes).toBe('Updated notes');
      expect(useMuseStore.getState().muses[1]).toEqual(testMuse2);
    });

    it('sets error on failure', async () => {
      mockUpdateMuse.mockRejectedValue(new Error('Update failed'));

      await useMuseStore.getState().updateMuse('m1', { notes: 'fail' });

      expect(useMuseStore.getState().error).toBe('Update failed');
    });
  });

  describe('moveMuse', () => {
    it('moves muse between boards and updates counts', async () => {
      useMuseStore.setState({
        boards: [{ ...testBoard, count: 1 }, { ...testBoard2, count: 2 }],
        muses: [testMuse],
      });
      mockMoveMuse.mockResolvedValue(undefined);

      await useMuseStore.getState().moveMuse('m1', 'b2');

      const { muses, boards } = useMuseStore.getState();
      expect(muses[0]!.boardId).toBe('b2');
      expect(boards[0]!.count).toBe(0);
      expect(boards[1]!.count).toBe(3);
    });

    it('moves muse to no board (null)', async () => {
      useMuseStore.setState({
        boards: [{ ...testBoard, count: 1 }],
        muses: [testMuse],
      });
      mockMoveMuse.mockResolvedValue(undefined);

      await useMuseStore.getState().moveMuse('m1', null);

      expect(useMuseStore.getState().muses[0]!.boardId).toBeUndefined();
      expect(useMuseStore.getState().boards[0]!.count).toBe(0);
    });

    it('sets error on failure', async () => {
      useMuseStore.setState({ muses: [testMuse] });
      mockMoveMuse.mockRejectedValue(new Error('Move failed'));

      await useMuseStore.getState().moveMuse('m1', 'b2');

      expect(useMuseStore.getState().error).toBe('Move failed');
    });
  });

  describe('deleteMuse', () => {
    it('removes muse from list', async () => {
      useMuseStore.setState({ boards: [testBoard], muses: [testMuse, testMuse2] });
      mockDeleteMuse.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteMuse('m1');

      expect(useMuseStore.getState().muses).toEqual([testMuse2]);
    });

    it('decrements board count', async () => {
      useMuseStore.setState({
        boards: [{ ...testBoard, count: 3 }],
        muses: [testMuse],
      });
      mockDeleteMuse.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteMuse('m1');

      expect(useMuseStore.getState().boards[0]!.count).toBe(2);
    });

    it('does not decrement below zero', async () => {
      useMuseStore.setState({
        boards: [{ ...testBoard, count: 0 }],
        muses: [testMuse],
      });
      mockDeleteMuse.mockResolvedValue(undefined);

      await useMuseStore.getState().deleteMuse('m1');

      expect(useMuseStore.getState().boards[0]!.count).toBe(0);
    });

    it('sets error on failure', async () => {
      useMuseStore.setState({ muses: [testMuse] });
      mockDeleteMuse.mockRejectedValue(new Error('Delete failed'));

      await useMuseStore.getState().deleteMuse('m1');

      expect(useMuseStore.getState().error).toBe('Delete failed');
    });
  });

  describe('setActiveBoard', () => {
    it('sets active board id', () => {
      useMuseStore.getState().setActiveBoard('b1');
      expect(useMuseStore.getState().activeBoardId).toBe('b1');
    });

    it('clears active board id with null', () => {
      useMuseStore.setState({ activeBoardId: 'b1' });
      useMuseStore.getState().setActiveBoard(null);
      expect(useMuseStore.getState().activeBoardId).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error', () => {
      useMuseStore.setState({ error: 'some error' });
      useMuseStore.getState().clearError();
      expect(useMuseStore.getState().error).toBeNull();
    });
  });
});
