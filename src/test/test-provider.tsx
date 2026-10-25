import { Accordion, MantineProvider, mergeThemeOverrides } from '@mantine/core';
import type { ReactNode } from 'react';
import { theme } from '@/app/theme';

const testTheme = mergeThemeOverrides(theme, {
  components: { Accordion: Accordion.extend({ defaultProps: { transitionDuration: 0 } }) },
});

export function TestProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={testTheme} defaultColorScheme="dark" env="test">
      {children}
    </MantineProvider>
  );
}
