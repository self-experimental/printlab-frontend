import { render as testingLibraryRender, type RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestProvider } from './test-provider';

export function render(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return testingLibraryRender(ui, { wrapper: TestProvider, ...options });
}
