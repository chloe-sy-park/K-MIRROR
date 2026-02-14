import { renderHook } from '@testing-library/react';
import { useScrollAnimation } from './useScrollAnimation';

describe('useScrollAnimation', () => {
  it('returns ref and isInView', () => {
    const { result } = renderHook(() => useScrollAnimation());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.isInView).toBe(true); // mocked useInView returns true
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() =>
      useScrollAnimation({ once: false, margin: '-50px' }),
    );
    expect(result.current.ref).toBeDefined();
    expect(result.current.isInView).toBe(true);
  });
});
