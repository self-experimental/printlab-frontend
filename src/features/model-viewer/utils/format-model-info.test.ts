import { expect, it } from 'vitest';
import { formatFileSize, formatModelInfo } from './format-model-info';
import { EXAMPLE_MODEL } from '../stl';

it('показывает размеры по-русски без технического количества граней', () => {
  expect(formatModelInfo({ ...EXAMPLE_MODEL, dimensions: [90, 16.5, 90] })).toBe(
    '90 × 16,5 × 90 мм',
  );
});

it.each([
  [134, '134 Б'],
  [1024, '1 КБ'],
  [1536, '1,5 КБ'],
  [1_572_864, '1,5 МБ'],
])('форматирует размер файла %s', (bytes, text) => {
  expect(formatFileSize(bytes)).toBe(text);
});
