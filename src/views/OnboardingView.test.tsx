import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingView from './OnboardingView';
import { useSettingsStore } from '@/store/settingsStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

function renderView() {
  return render(
    <MemoryRouter>
      <OnboardingView />
    </MemoryRouter>
  );
}

describe('OnboardingView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useSettingsStore.setState({ isOnboarded: false });
  });

  it('renders the onboarding header', () => {
    renderView();
    expect(screen.getByText('onboarding.tagline')).toBeInTheDocument();
    expect(screen.getByText('onboarding.title')).toBeInTheDocument();
  });

  it('shows environment selection options', () => {
    renderView();
    expect(screen.getByText('onboarding.environment')).toBeInTheDocument();
    expect(screen.getByText('onboarding.office')).toBeInTheDocument();
    expect(screen.getByText('onboarding.outdoor')).toBeInTheDocument();
    expect(screen.getByText('onboarding.studio')).toBeInTheDocument();
  });

  it('shows skill level selection options', () => {
    renderView();
    expect(screen.getByText('onboarding.skill')).toBeInTheDocument();
    expect(screen.getByText('onboarding.beginner')).toBeInTheDocument();
    expect(screen.getByText('onboarding.intermediate')).toBeInTheDocument();
    expect(screen.getByText('onboarding.pro')).toBeInTheDocument();
  });

  it('shows mood selection options', () => {
    renderView();
    expect(screen.getByText('onboarding.mood')).toBeInTheDocument();
    expect(screen.getByText('onboarding.natural')).toBeInTheDocument();
    expect(screen.getByText('onboarding.elegant')).toBeInTheDocument();
    expect(screen.getByText('onboarding.powerful')).toBeInTheDocument();
  });

  it('shows the start button', () => {
    renderView();
    expect(screen.getByText('onboarding.start')).toBeInTheDocument();
  });

  it('has three radiogroups for environment, skill, and mood', () => {
    renderView();
    const radiogroups = screen.getAllByRole('radiogroup');
    expect(radiogroups).toHaveLength(3);
  });

  it('defaults to Office, Beginner, Natural selections', () => {
    renderView();
    const officeRadio = screen.getByRole('radio', { name: 'onboarding.office' });
    const beginnerRadio = screen.getByRole('radio', { name: 'onboarding.beginner' });
    const naturalRadio = screen.getByRole('radio', { name: 'onboarding.natural' });

    expect(officeRadio).toHaveAttribute('aria-checked', 'true');
    expect(beginnerRadio).toHaveAttribute('aria-checked', 'true');
    expect(naturalRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('selects a different environment when clicked', () => {
    renderView();
    const outdoorRadio = screen.getByRole('radio', { name: 'onboarding.outdoor' });
    fireEvent.click(outdoorRadio);

    expect(outdoorRadio).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'onboarding.office' })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects a different skill level when clicked', () => {
    renderView();
    const proRadio = screen.getByRole('radio', { name: 'onboarding.pro' });
    fireEvent.click(proRadio);

    expect(proRadio).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'onboarding.beginner' })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects a different mood when clicked', () => {
    renderView();
    const elegantRadio = screen.getByRole('radio', { name: 'onboarding.elegant' });
    fireEvent.click(elegantRadio);

    expect(elegantRadio).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'onboarding.natural' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls completeOnboarding with selected prefs and navigates home on start', () => {
    renderView();

    // Change selections from defaults
    fireEvent.click(screen.getByRole('radio', { name: 'onboarding.studio' }));
    fireEvent.click(screen.getByRole('radio', { name: 'onboarding.pro' }));
    fireEvent.click(screen.getByRole('radio', { name: 'onboarding.powerful' }));

    fireEvent.click(screen.getByText('onboarding.start'));

    const state = useSettingsStore.getState();
    expect(state.isOnboarded).toBe(true);
    expect(state.prefs).toEqual({
      environment: 'Studio',
      skill: 'Pro',
      mood: 'Powerful',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('calls completeOnboarding with default prefs when no changes are made', () => {
    renderView();
    fireEvent.click(screen.getByText('onboarding.start'));

    const state = useSettingsStore.getState();
    expect(state.isOnboarded).toBe(true);
    expect(state.prefs).toEqual({
      environment: 'Office',
      skill: 'Beginner',
      mood: 'Natural',
    });
  });
});
