import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ModelViewer } from './model-viewer';
import { EXAMPLE_MODEL } from './stl';

it('поворачивает, масштабирует и переключает каркас модели', async () => {
  const user = userEvent.setup();
  render(<ModelViewer model={EXAMPLE_MODEL} />);
  const svg = screen.getByRole('img');
  const before = svg.innerHTML;
  await user.click(screen.getByRole('button', { name: 'Повернуть влево' }));
  expect(svg.innerHTML).not.toEqual(before);
  await user.click(screen.getByRole('button', { name: 'Повернуть вправо' }));
  expect(svg.innerHTML).toEqual(before);
  for (let i = 0; i < 8; i++)
    await user.click(screen.getByRole('button', { name: 'Увеличить модель' }));
  for (let i = 0; i < 12; i++)
    await user.click(screen.getByRole('button', { name: 'Уменьшить модель' }));
  await user.click(screen.getByRole('button', { name: 'Каркас' }));
  expect(screen.getByRole('button', { name: 'Каркас' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'Каркас' }));
  expect(screen.getByRole('button', { name: 'Каркас' })).toHaveAttribute('aria-pressed', 'false');
});
it('сообщает об упрощённом просмотре больших моделей', () => {
  render(
    <ModelViewer
      model={{
        ...EXAMPLE_MODEL,
        triangles: Array.from(
          { length: 1600 },
          () =>
            EXAMPLE_MODEL.triangles[0] ?? [
              [0, 0, 0],
              [1, 0, 0],
              [0, 1, 0],
            ],
        ),
      }}
    />,
  );
  expect(screen.getByText(/Облегчённый просмотр/)).toBeVisible();
});
