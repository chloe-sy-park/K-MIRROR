import { render, screen, fireEvent, act } from '@testing-library/react';
import CookieConsentBanner from './CookieConsentBanner';
import { useConsentStore } from '@/store/consentStore';

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    act(() => {
      useConsentStore.getState().resetConsent();
    });
  });

  it('renders when cookieConsent is null', () => {
    render(<CookieConsentBanner />);
    expect(screen.getByText('consent.cookieMessage')).toBeInTheDocument();
  });

  it('hides after accepting cookies', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByText('consent.cookieAccept'));
    expect(screen.queryByText('consent.cookieMessage')).not.toBeInTheDocument();
  });

  it('hides after declining cookies', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByText('consent.cookieDecline'));
    expect(screen.queryByText('consent.cookieMessage')).not.toBeInTheDocument();
  });

  it('does not render when cookieConsent is already set', () => {
    act(() => {
      useConsentStore.getState().acceptCookies();
    });
    render(<CookieConsentBanner />);
    expect(screen.queryByText('consent.cookieMessage')).not.toBeInTheDocument();
  });
});
