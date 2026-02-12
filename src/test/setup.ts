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

// Creates a passthrough component for a given HTML tag, filtering framer-motion props
const MOTION_PROPS = ['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'whileInView', 'layout'];
const MOTION_TAGS = ['div', 'section', 'button', 'p', 'span', 'header', 'img', 'a', 'nav', 'input', 'label', 'h1', 'h2', 'h3', 'li', 'ul'];

function buildMotionElements(React: typeof import('react')) {
  const elements: Record<string, unknown> = {};
  for (const tag of MOTION_TAGS) {
    elements[tag] = ({ children, ...props }: Record<string, unknown>) => {
      const filtered = Object.fromEntries(
        Object.entries(props).filter(([k]) => !MOTION_PROPS.includes(k))
      );
      return React.createElement(tag, filtered, children as never);
    };
  }
  return elements;
}

// Mock framer-motion (AnimatePresence, LazyMotion, domAnimation, hooks)
vi.mock('framer-motion', async () => {
  const React = await import('react');
  return {
    motion: buildMotionElements(React),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    LazyMotion: ({ children }: { children: React.ReactNode }) => children,
    domAnimation: {},
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useInView: () => true,
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => ({ get: () => output[0] }),
  };
});

// Mock framer-motion/m (lightweight motion component — exports individual element factories)
vi.mock('framer-motion/m', async () => {
  const React = await import('react');
  return buildMotionElements(React);
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
