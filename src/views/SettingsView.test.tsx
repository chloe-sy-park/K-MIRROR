import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsView from './SettingsView';
import { useSettingsStore } from '@/store/settingsStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsView />
    </MemoryRouter>,
  );
}

describe('SettingsView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useSettingsStore.setState({
      isSensitive: false,
      isOnboarded: true,
      prefs: { environment: 'Office', skill: 'Beginner', mood: 'Natural' },
    });
  });

  it('renders settings title', () => {
    renderSettings();
    expect(screen.getByText('settings.system')).toBeInTheDocument();
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('shows inclusion guard and neural safety filter labels', () => {
    renderSettings();
    expect(screen.getByText('settings.inclusionGuard')).toBeInTheDocument();
    expect(screen.getByText('settings.inclusionGuardDesc')).toBeInTheDocument();
    expect(screen.getByText('settings.neuralSafetyFilter')).toBeInTheDocument();
    expect(screen.getByText('settings.neuralSafetyDesc')).toBeInTheDocument();
  });

  it('renders toggle switches reflecting isSensitive state', () => {
    useSettingsStore.setState({ isSensitive: true });
    renderSettings();

    const toggles = screen.getAllByRole('switch');
    expect(toggles).toHaveLength(2);
    toggles.forEach((toggle) => {
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('calls toggleSensitive when a toggle is clicked', () => {
    const toggleSpy = vi.fn();
    useSettingsStore.setState({ toggleSensitive: toggleSpy } as never);
    renderSettings();

    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[0]);
    expect(toggleSpy).toHaveBeenCalled();
  });

  it('shows language selector buttons', () => {
    renderSettings();
    expect(screen.getByText('settings.language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
  });

  it('resets data and navigates to onboarding when reset button is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByText('settings.resetNeural'));

    expect(useSettingsStore.getState().isOnboarded).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });
});
