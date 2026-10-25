import { screen } from '@testing-library/react';
import { render } from '@/test/render';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './error-boundary';

function BrokenComponent(): never {
  throw new Error('Test render failure');
}

describe('ErrorBoundary', () => {
  it('показывает содержимое, когда ошибки нет', () => {
    render(
      <ErrorBoundary>
        <p>Приложение работает</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Приложение работает')).toBeVisible();
  });

  it('перехватывает ошибку рендера и предлагает перезагрузку', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reload = vi.fn();
    vi.stubGlobal('location', { reload });
    const user = userEvent.setup();

    try {
      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Не удалось открыть приложение');
      expect(screen.queryByText('Test render failure')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Перезагрузить' }));
      expect(reload).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
