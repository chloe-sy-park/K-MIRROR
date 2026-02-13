import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConsentState {
  biometricConsent: boolean;
  cookieConsent: 'accepted' | 'declined' | null;

  acceptBiometric: () => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  resetConsent: () => void;
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      biometricConsent: false,
      cookieConsent: null,

      acceptBiometric: () => set({ biometricConsent: true }),
      acceptCookies: () => set({ cookieConsent: 'accepted' }),
      declineCookies: () => set({ cookieConsent: 'declined' }),
      resetConsent: () => set({ biometricConsent: false, cookieConsent: null }),
    }),
    { name: 'kmirror_consent' }
  )
);
