import { ActionIcon, Button, createTheme, Select, NumberInput, Paper } from '@mantine/core';

export const theme = createTheme({
  colors: {
    dark: [
      '#edf1f7',
      '#c1cad6',
      '#acb8c9',
      '#708096',
      '#455468',
      '#354252',
      '#252e3b',
      '#1b232e',
      '#151c26',
      '#10151d',
    ],
  },
  primaryColor: 'teal',
  primaryShade: 9,
  autoContrast: true,
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: { fontFamily: 'inherit', fontWeight: '650' },
  components: {
    Button: Button.extend({ defaultProps: { size: 'md', fw: 600 } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { size: 44, variant: 'default' } }),
    Select: Select.extend({
      defaultProps: {
        size: 'md',
        allowDeselect: false,
        rightSection: null,
        rightSectionWidth: 0,
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { size: 'md', allowNegative: false, clampBehavior: 'none' },
    }),
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
  },
});
