import { useConsentStore } from './consentStore';
import { act } from '@testing-library/react';

describe('consentStore', () => {
  beforeEach(() => {
    act(() => {
      useConsentStore.getState().resetConsent();
    });
  });

  it('has correct initial state', () => {
    const state = useConsentStore.getState();
    expect(state.biometricConsent).toBe(false);
    expect(state.cookieConsent).toBeNull();
  });

  it('acceptBiometric sets biometricConsent to true', () => {
    act(() => {
      useConsentStore.getState().acceptBiometric();
    });
    expect(useConsentStore.getState().biometricConsent).toBe(true);
  });

  it('acceptCookies sets cookieConsent to accepted', () => {
    act(() => {
      useConsentStore.getState().acceptCookies();
    });
    expect(useConsentStore.getState().cookieConsent).toBe('accepted');
  });

  it('declineCookies sets cookieConsent to declined', () => {
    act(() => {
      useConsentStore.getState().declineCookies();
    });
    expect(useConsentStore.getState().cookieConsent).toBe('declined');
  });

  it('resetConsent resets all values', () => {
    act(() => {
      useConsentStore.getState().acceptBiometric();
      useConsentStore.getState().acceptCookies();
    });
    expect(useConsentStore.getState().biometricConsent).toBe(true);
    act(() => {
      useConsentStore.getState().resetConsent();
    });
    expect(useConsentStore.getState().biometricConsent).toBe(false);
    expect(useConsentStore.getState().cookieConsent).toBeNull();
  });
});
