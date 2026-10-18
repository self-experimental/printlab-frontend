import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from './home-page';
import { MAX_FILE_SIZE } from '@/features/model-viewer/stl';

const source =
  'solid x facet normal 0 0 1 outer loop vertex 0 0 0 vertex 1 0 0 vertex 0 1 0 endloop endfacet endsolid x';
function file(name = 'test.stl', content = source) {
  const f = new File([content], name);
  Object.defineProperty(f, 'arrayBuffer', {
    value: () => Promise.resolve(new TextEncoder().encode(content).buffer),
  });
  return f;
}
function upload(f: File | undefined) {
  fireEvent.change(screen.getByLabelText('Выберите STL-модель'), {
    target: { files: f ? [f] : [] },
  });
}

describe('Рабочий экран', () => {
  it('показывает честное начальное состояние и переключает тему', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    expect(screen.getByText('Здесь появится результат')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Включить светлую тему' }));
    await user.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
    const input = screen.getByLabelText('Выберите STL-модель');
    const click = vi.spyOn(input, 'click');
    await user.click(screen.getByRole('button', { name: /Загрузить модель/ }));
    expect(click).toHaveBeenCalled();
    upload(undefined);
    expect(screen.getByText('Модель ещё не загружена')).toBeVisible();
  });
  it('сохраняет параметры демозапроса и сбрасывает результат при изменении формы', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.selectOptions(screen.getByLabelText('Материал'), 'PETG');
    await user.click(screen.getByRole('button', { name: /Запустить оптимизацию/ }));
    expect(screen.getByRole('table')).toBeVisible();
    await user.click(screen.getByText('Параметры вашего запроса'));
    expect(screen.getByText(/PETG · 100 Н/)).toBeVisible();
    expect(screen.getByText(/Фиксированный пример/)).toBeVisible();
    await user.click(screen.getByLabelText('Минимальный вес'));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Запустить оптимизацию/ }));
    expect(screen.getByText('Требования: Не выбраны')).toBeInTheDocument();
  });
  it('загружает STL, показывает геометрию и удаляет модель', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    upload(file());
    await screen.findByText('test.stl');
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Модель успешно загружена.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Закрыть уведомление' }));
    expect(screen.getByText(/1 граней/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Запустить оптимизацию/ }));
    expect(screen.getByText(/test.stl · PLA/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(screen.getByText('Модель ещё не загружена')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('объясняет ошибки расширения, размера, чтения и геометрии', async () => {
    render(<HomePage />);
    upload(file('test.txt'));
    expect(screen.getByRole('alert')).toHaveTextContent('расширением');
    const huge = file();
    Object.defineProperty(huge, 'size', { value: MAX_FILE_SIZE + 1 });
    upload(huge);
    expect(screen.getByRole('alert')).toHaveTextContent('15 МБ');
    upload(file('bad.stl', 'broken'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось'));
    const failed = new File([], 'failed.stl');
    Object.defineProperty(failed, 'arrayBuffer', {
      value: () => Promise.reject(new Error('read failed')),
    });
    upload(failed);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Загрузить модель/ })).toBeEnabled(),
    );
  });
  it('не подменяет новую модель результатом предыдущего чтения', async () => {
    render(<HomePage />);
    let resolveOld: (buffer: ArrayBuffer) => void = () => undefined;
    const old = new File([], 'old.stl');
    Object.defineProperty(old, 'arrayBuffer', {
      value: () =>
        new Promise<ArrayBuffer>((resolve) => {
          resolveOld = resolve;
        }),
    });
    upload(old);
    upload(file('new.stl'));
    await screen.findByText('new.stl');
    resolveOld(new TextEncoder().encode(source).buffer);
    await waitFor(() => expect(screen.queryByText('old.stl')).not.toBeInTheDocument());
  });
  it('скрывает уведомление автоматически и не блокирует форму', () => {
    vi.useFakeTimers();
    try {
      render(<HomePage />);
      upload(file('wrong.txt'));
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Максимальная нагрузка, Н')).toBeEnabled();
      act(() => {
        vi.advanceTimersByTime(7000);
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
