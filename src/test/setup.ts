import '@testing-library/jest-dom';

// Mock @google/genai — heavy SDK that hangs in jsdom
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: vi.fn().mockResolvedValue({ text: '{}' }) };
  },
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY', BOOLEAN: 'BOOLEAN' },
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

// Mock framer-motion to avoid JSDOM issues
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string') {
        return ({ children, ...props }: Record<string, unknown>) => {
          const { createElement } = require('react');
          const filteredProps = Object.fromEntries(
            Object.entries(props).filter(([key]) =>
              !['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'whileInView', 'layout'].includes(key)
            )
          );
          return createElement(prop, filteredProps, children as never);
        };
      }
      return undefined;
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
  useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  useTransform: (value: unknown, input: unknown, output: unknown[]) => ({ get: () => output[0] }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
