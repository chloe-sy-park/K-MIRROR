import { useSettingsStore } from './settingsStore';

const defaultPrefs = { environment: 'Office' as const, skill: 'Beginner' as const, mood: 'Natural' as const };

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ prefs: defaultPrefs, isSensitive: false, isOnboarded: false });
  });

  it('has correct initial state', () => {
    const state = useSettingsStore.getState();
    expect(state.prefs).toEqual(defaultPrefs);
    expect(state.isSensitive).toBe(false);
    expect(state.isOnboarded).toBe(false);
  });

  describe('setPrefs', () => {
    it('updates preferences', () => {
      const newPrefs = { environment: 'Outdoor' as const, skill: 'Pro' as const, mood: 'Powerful' as const };

      useSettingsStore.getState().setPrefs(newPrefs);

      expect(useSettingsStore.getState().prefs).toEqual(newPrefs);
    });
  });

  describe('toggleSensitive', () => {
    it('toggles isSensitive from false to true', () => {
      useSettingsStore.getState().toggleSensitive();
      expect(useSettingsStore.getState().isSensitive).toBe(true);
    });

    it('toggles isSensitive from true to false', () => {
      useSettingsStore.setState({ isSensitive: true });
      useSettingsStore.getState().toggleSensitive();
      expect(useSettingsStore.getState().isSensitive).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('sets prefs and marks onboarding complete', () => {
      const prefs = { environment: 'Studio' as const, skill: 'Intermediate' as const, mood: 'Elegant' as const };

      useSettingsStore.getState().completeOnboarding(prefs);

      expect(useSettingsStore.getState().prefs).toEqual(prefs);
      expect(useSettingsStore.getState().isOnboarded).toBe(true);
    });
  });

  describe('resetData', () => {
    it('resets to default values', () => {
      useSettingsStore.setState({
        prefs: { environment: 'Outdoor', skill: 'Pro', mood: 'Powerful' },
        isSensitive: true,
        isOnboarded: true,
      });

      useSettingsStore.getState().resetData();

      expect(useSettingsStore.getState().prefs).toEqual(defaultPrefs);
      expect(useSettingsStore.getState().isOnboarded).toBe(false);
    });

    it('does not reset isSensitive', () => {
      useSettingsStore.setState({ isSensitive: true, isOnboarded: true });

      useSettingsStore.getState().resetData();

      expect(useSettingsStore.getState().isSensitive).toBe(true);
    });
  });
});
