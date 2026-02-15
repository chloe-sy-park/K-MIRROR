import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, trackPageView } from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).gtag = undefined;
  });

  describe('trackEvent', () => {
    it('calls window.gtag with event name and params', () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      trackEvent('test_event', { key: 'value' });

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', { key: 'value' });
    });

    it('does not throw when window.gtag is not defined', () => {
      expect(() => trackEvent('test_event')).not.toThrow();
    });

    it('works without params', () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      trackEvent('test_event');

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', undefined);
    });
  });

  describe('trackPageView', () => {
    it('sends page_view event with path and title', () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      trackPageView('/test', 'Test Page');

      expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test',
        page_title: 'Test Page',
      });
    });

    it('does not throw when window.gtag is not defined', () => {
      expect(() => trackPageView('/test')).not.toThrow();
    });

    it('works without title', () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      trackPageView('/test');

      expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test',
        page_title: undefined,
      });
    });
  });
});
