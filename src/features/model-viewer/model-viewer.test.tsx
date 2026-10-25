import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ModelViewer } from './model-viewer';
import { EXAMPLE_MODEL } from './stl';
import { MockWebGLRenderer } from '@/test/webgl-renderer';

afterEach(() => {
  MockWebGLRenderer.fail = false;
  MockWebGLRenderer.instances = [];
});
async function viewer() {
  const result = render(<ModelViewer model={EXAMPLE_MODEL} />);
  const surface = screen.getByRole('img');
  const image = () => surface.querySelector('canvas')?.getAttribute('data-projection');
  await waitFor(() => {
    expect(image()).toBeTruthy();
  });
  return { ...result, surface, image };
}

it('показывает цельную модель без надписей, каркаса и выбора ракурса', async () => {
  const { surface } = await viewer();
  expect(surface.querySelector('canvas')).toBeInTheDocument();
  expect(surface.textContent).toBe('');
  expect(screen.queryByText(/Облегчённый просмотр|Перетаскивайте/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Каркас' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Ракурс')).not.toBeInTheDocument();
});

it('вращает, наклоняет, масштабирует кнопками и возвращает исходный вид', async () => {
  const user = userEvent.setup();
  const { image } = await viewer();
  const before = image();
  for (const name of [
    'Повернуть влево',
    'Повернуть вправо',
    'Наклонить вверх',
    'Наклонить вниз',
    'Увеличить модель',
    'Уменьшить модель',
  ]) {
    const previous = image();
    await user.click(screen.getByRole('button', { name }));
    await waitFor(() => {
      expect(image()).not.toEqual(previous);
    });
  }
  await user.click(screen.getByRole('button', { name: 'Сбросить вид' }));
  await waitFor(() => {
    expect(image()).toEqual(before);
  });
});

it('поддерживает клавиатуру и колесо, ограничивает масштаб', async () => {
  const { surface, image } = await viewer();
  const before = image();
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'])
    fireEvent.keyDown(surface, { key });
  await waitFor(() => {
    expect(image()).not.toEqual(before);
  });
  fireEvent.keyDown(surface, { key: 'Home' });
  await waitFor(() => {
    expect(image()).toEqual(before);
  });
  fireEvent.keyDown(surface, { key: 'Tab' });
  expect(image()).toEqual(before);
  for (const deltaMode of [0, 1, 2]) fireEvent.wheel(surface, { deltaY: -1, deltaMode });
  await waitFor(() => {
    expect(image()).not.toEqual(before);
  });
  fireEvent.wheel(surface, { deltaY: -100_000 });
  await waitFor(() => {
    expect(image()).toBeTruthy();
  });
  fireEvent.wheel(surface, { deltaY: 100_000 });
  await waitFor(() => {
    expect(image()).not.toEqual(before);
  });
});

it('вращает перетаскиванием, масштабирует щипком и завершает отменённый жест', async () => {
  const { surface, image } = await viewer();
  Object.assign(surface, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    hasPointerCapture: () => true,
  });
  function pointer(type: string, pointerId: number, x: number, y: number, button = 0) {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, { pointerId, clientX: x, clientY: y, button });
    fireEvent(surface, event);
  }
  const before = image();
  pointer('pointermove', 1, 100, 100);
  pointer('pointerdown', 1, 100, 100, 2);
  pointer('pointermove', 1, 130, 120);
  expect(image()).toEqual(before);
  pointer('pointerdown', 1, 100, 100);
  pointer('pointermove', 1, 130, 120);
  await waitFor(() => {
    expect(image()).not.toEqual(before);
  });
  pointer('pointerdown', 2, 230, 120);
  const rotated = image();
  pointer('pointermove', 2, 300, 120);
  await waitFor(() => {
    expect(image()).not.toEqual(rotated);
  });
  pointer('pointerdown', 3, 400, 120);
  pointer('pointercancel', 2, 300, 120);
  pointer('pointerup', 1, 130, 120);
  Object.assign(surface, { hasPointerCapture: () => false });
  pointer('lostpointercapture', 1, 130, 120);
  const ended = image();
  pointer('pointermove', 1, 330, 220);
  expect(image()).toEqual(ended);
  pointer('pointerdown', 1, 100, 100);
  pointer('pointerdown', 2, 100, 100);
  pointer('pointermove', 2, 100, 100);
  expect(image()).toEqual(ended);
});

it('объясняет недоступность 3D и позволяет повторить', async () => {
  MockWebGLRenderer.fail = true;
  render(<ModelViewer model={EXAMPLE_MODEL} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось открыть 3D-просмотр');
  MockWebGLRenderer.fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Попробовать ещё раз' }));
  await waitFor(() => {
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

it('освобождает сцену при уходе и сообщает о потере контекста', async () => {
  const { surface, unmount } = await viewer();
  const canvas = surface.querySelector('canvas');
  if (!canvas) throw new Error('Canvas not created');
  fireEvent(canvas, new Event('webglcontextlost', { cancelable: true }));
  expect(screen.getByRole('alert')).toHaveTextContent('Попробуйте ещё раз');
  unmount();
  expect(MockWebGLRenderer.instances.at(-1)?.disposed).toBe(true);
});
