import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      loading: true,
      error: null,
      isAuthModalOpen: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.isAuthModalOpen).toBe(false);
  });

  describe('openAuthModal', () => {
    it('sets isAuthModalOpen to true', () => {
      useAuthStore.getState().openAuthModal();
      expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    });

    it('clears error when opening modal', () => {
      useAuthStore.setState({ error: 'Previous error' });
      useAuthStore.getState().openAuthModal();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('closeAuthModal', () => {
    it('sets isAuthModalOpen to false', () => {
      useAuthStore.setState({ isAuthModalOpen: true });
      useAuthStore.getState().closeAuthModal();
      expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
    });

    it('clears error when closing modal', () => {
      useAuthStore.setState({ isAuthModalOpen: true, error: 'Some error' });
      useAuthStore.getState().closeAuthModal();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('sets error to null', () => {
      useAuthStore.setState({ error: 'test error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('initialize', () => {
    it('sets loading to false when supabase is not configured', async () => {
      await useAuthStore.getState().initialize();
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });
});
