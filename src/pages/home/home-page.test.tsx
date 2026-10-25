import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './home-page';
import { MAX_FILE_SIZE } from '@/features/model-viewer/stl';
import { calculationResponse } from '@/test/optimization-fixtures';
import catalog from '@/test/material-catalog.json';

vi.mock('@/features/materials/api/materials', () => ({
  fetchMaterialCatalog: () => Promise.resolve(catalog),
}));

const source =
  'solid x facet normal 0 0 1 outer loop vertex 0 0 0 vertex 1 0 0 vertex 0 1 0 endloop endfacet endsolid x';
function file(name = 'test.stl', content = source) {
  const f = new File([content], name);
  Object.defineProperty(f, 'arrayBuffer', {
    configurable: true,
    value: () => Promise.resolve(new TextEncoder().encode(content).buffer),
  });
  return f;
}
function renderLoadPage() {
  const view = render(<HomePage />);
  fireEvent.click(screen.getByRole('combobox', { name: 'Режим расчёта' }));
  fireEvent.click(screen.getByRole('option', { name: 'Нагрузка по испытаниям образцов' }));
  return view;
}
function upload(f: File | undefined) {
  fireEvent.change(screen.getByLabelText('Выберите STL-модель'), {
    target: { files: f ? [f] : [] },
  });
}
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(calculationResponse)))),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Рабочий экран', () => {
  it('открывает модель локально и не обращается к серверу при выборе, просмотре и удалении', async () => {
    const user = userEvent.setup();
    renderLoadPage();
    expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeDisabled();
    expect(screen.getByText('Здесь появится результат')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Включить светлую тему' }));
    await user.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
    const click = vi.spyOn(screen.getByLabelText('Выберите STL-модель'), 'click');
    await user.click(screen.getByRole('button', { name: /Загрузить модель/ }));
    expect(click).toHaveBeenCalled();
    upload(undefined);
    upload(file());
    await screen.findByText('test.stl');
    expect(screen.getByText('1 × 1 × 0 мм')).toBeVisible();
    expect(screen.getByText('Модель открыта.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Закрыть уведомление' }));
    await user.click(screen.getByRole('button', { name: 'Убрать из просмотра' }));
    expect(screen.getByText('Модель ещё не загружена')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('отправляет файл и параметры только по кнопке, выводит реальные данные и сбрасывает результат при изменении', async () => {
    const user = userEvent.setup();
    renderLoadPage();
    const selected = file();
    upload(selected);
    await screen.findByText('test.stl');
    await user.clear(screen.getByLabelText('Максимальная нагрузка, Н'));
    await user.type(screen.getByLabelText('Максимальная нагрузка, Н'), '40');
    expect(fetch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
    await screen.findByRole('table');
    expect(screen.getByText('40,45 Н')).toBeVisible();
    expect(screen.getByText('13,74 г')).toBeVisible();
    expect(screen.queryByText('215 Н')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Расчёт готов' })).toBeDisabled();
    expect(fetch).toHaveBeenCalledTimes(1);
    const options = vi.mocked(fetch).mock.calls[0]?.[1];
    const body = options?.body as FormData;
    expect(body.get('file')).toBe(selected);
    expect(body.get('requiredLoadN')).toBe('40');
    expect(body.get('safetyFactor')).toBe('2');
    await user.click(screen.getByText('Параметры вашего запроса'));
    expect(screen.getByText(/test.stl · PLA · 40 Н/)).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Материал' }));
    await user.click(screen.getByRole('option', { name: 'Prusament PETG' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled();
  });

  it('блокирует повторный запрос, отменяет устаревший расчёт и не подменяет новые параметры', async () => {
    let resolveResponse: (r: Response) => void = () => undefined;
    const request = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal('fetch', request);
    const user = userEvent.setup();
    renderLoadPage();
    upload(file());
    await screen.findByText('test.stl');
    await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole('button', { name: 'Подбираем параметры…' })).toBeDisabled();
    const options = request.mock.calls[0]?.[1] as RequestInit;
    await user.click(screen.getByRole('combobox', { name: 'Материал' }));
    await user.click(screen.getByRole('option', { name: 'Prusament PETG' }));
    expect(options.signal?.aborted).toBe(true);
    resolveResponse(new Response(JSON.stringify(calculationResponse)));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('показывает понятную причину отсутствия данных и разрешает повторную попытку без потери модели', async () => {
    const user = userEvent.setup();
    renderLoadPage();
    upload(file());
    await screen.findByText('test.stl');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ code: 'MODEL_NOT_SUPPORTED', message: 'internal details' }),
            { status: 422 },
          ),
        ),
    );
    await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('нет подходящих испытаний');
    });
    expect(screen.getByText('test.stl')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled();
  });

  it('объясняет ошибки файла и сохраняет предыдущую модель', async () => {
    renderLoadPage();
    upload(file());
    await screen.findByText('test.stl');
    upload(file('wrong.txt'));
    expect(screen.getByRole('alert')).toHaveTextContent('расширением');
    const huge = file();
    Object.defineProperty(huge, 'size', { value: MAX_FILE_SIZE + 1 });
    upload(huge);
    expect(screen.getByRole('alert')).toHaveTextContent('15 МБ');
    upload(new File([], 'empty.stl'));
    expect(screen.getByRole('alert')).toHaveTextContent('пуст');
    upload(file('bad.stl', 'broken'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Экспортируйте');
    });
    expect(screen.getByText('test.stl')).toBeVisible();
    const failed = file('failed.stl');
    Object.defineProperty(failed, 'arrayBuffer', {
      value: () => Promise.reject(new Error('read failed')),
    });
    upload(failed);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Выберите его заново');
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('не обновляет страницу после ухода во время чтения файла', async () => {
    let finish: (data: ArrayBuffer) => void = () => undefined;
    const delayed = new File(['x'], 'slow.stl');
    Object.defineProperty(delayed, 'arrayBuffer', {
      value: () =>
        new Promise<ArrayBuffer>((resolve) => {
          finish = resolve;
        }),
    });
    const { unmount } = renderLoadPage();
    upload(delayed);
    expect(screen.getByLabelText('Выберите STL-модель')).toBeDisabled();
    unmount();
    finish(new TextEncoder().encode(source).buffer);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
