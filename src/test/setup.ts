import '@testing-library/jest-dom';

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
