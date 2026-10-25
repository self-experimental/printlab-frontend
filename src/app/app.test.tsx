import { screen } from '@testing-library/react';
import { render } from '@/test/render';
import { expect, it } from 'vitest';
import { App } from './app';

it('собирает корневые провайдеры и маршрутизатор', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Меньше материала.');
});
