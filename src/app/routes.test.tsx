import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from './routes';

describe('Маршруты приложения', () => {
  it('открывает главную страницу', () => {
    render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Меньше материала.');
    expect(screen.getByRole('link', { name: /Print Lab/ })).toHaveAttribute('href', '/');
    expect(screen.getByText('Здесь появится результат')).toBeVisible();
  });

  it('показывает 404 для неизвестного адреса и позволяет вернуться домой', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'На главную' }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Меньше материала.');
    expect(screen.queryByText('Страница не найдена')).not.toBeInTheDocument();
  });
});
