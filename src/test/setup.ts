import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('three', async (importOriginal) => {
  const original = await importOriginal<typeof import('three')>();
  const { MockWebGLRenderer } = await import('./webgl-renderer');
  return { ...original, WebGLRenderer: MockWebGLRenderer };
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: class {
    observe() {
      /* Layout is tested in Playwright. */
    }
    disconnect() {
      /* No native observer in jsdom. */
    }
    unobserve() {
      /* Layout is tested in Playwright. */
    }
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
