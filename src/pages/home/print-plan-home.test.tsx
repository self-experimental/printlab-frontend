import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@/test/render';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HomePage } from './home-page';
import catalog from '@/test/material-catalog.json';
import response from '@/test/print-plan-response.json';
import source from '../../../fixtures/stepped-block.stl?raw';
vi.mock('@/features/materials/api/materials', () => ({
  fetchMaterialCatalog: () => Promise.resolve(catalog),
}));
function upload() {
  const file = new File([source], 'part.stl');
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(new TextEncoder().encode(source).buffer),
  });
  fireEvent.change(screen.getByLabelText('Выберите STL-модель'), { target: { files: [file] } });
  return file;
}
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response))));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

it('по умолчанию подбирает печать A1 mini, не отправляет файл до кнопки и показывает реальные варианты', async () => {
  const user = userEvent.setup();
  render(<HomePage />);
  expect(screen.getByLabelText('Режим расчёта')).toHaveValue('PRINT');
  expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeDisabled();
  const file = upload();
  await screen.findByText('part.stl');
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByRole('option', { name: /Prusament ASA/ })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await screen.findByRole('table');
  expect(screen.getByText('3,49 г')).toBeVisible();
  expect(screen.getByText('21,97 мин')).toBeVisible();
  expect(screen.getByText('Рекомендуем')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Расчёт готов' })).toBeDisabled();
  const [, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
  expect((options.body as FormData).get('file')).toBe(file);
  expect((options.body as FormData).get('materialProfileId')).toBe('prusament-pla');
  await user.click(screen.getByText('Как получен расчёт'));
  expect(screen.getByText(/Prusament PLA · Bambu Studio/)).toBeVisible();
  await user.selectOptions(screen.getByLabelText('Приоритет подбора'), 'MIN_TIME');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.selectOptions(screen.getByLabelText('Режим расчёта'), 'LOAD');
  expect(screen.getByLabelText('Максимальная нагрузка, Н')).toBeVisible();
});

it('явно показывает неполное сравнение без строк для нерассчитанных вариантов', async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ ...response, candidates: response.candidates.slice(0, 5) })),
  );
  const user = userEvent.setup();
  render(<HomePage />);
  upload();
  await screen.findByText('part.stl');
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await screen.findByRole('table');
  expect(screen.getByText('Сравнили 5 из 6 вариантов')).toBeVisible();
  expect(screen.getByText(/Рекомендация выбрана среди готовых вариантов/)).toBeVisible();
  expect(screen.getAllByRole('row')).toHaveLength(6);
});

it('отменяет устаревший запрос при смене параметров и не запускает повторный при двойном нажатии', async () => {
  let finish: (r: Response) => void = () => undefined;
  vi.mocked(fetch).mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  const user = userEvent.setup();
  render(<HomePage />);
  upload();
  await screen.findByText('part.stl');
  const button = screen.getByRole('button', { name: 'Запустить оптимизацию' });
  await user.dblClick(button);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/Готовим модель и сравниваем/)).toBeVisible();
  const options = vi.mocked(fetch).mock.calls[0]?.[1];
  await user.selectOptions(screen.getByLabelText('Качество поверхности'), '0.28');
  expect(options?.signal?.aborted).toBe(true);
  await act(async () => {
    finish(new Response(JSON.stringify(response)));
    await Promise.resolve();
  });
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('показывает отказ слайсера и позволяет повторить расчёт без потери файла', async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ code: 'NO_PRINT_PLAN' }), { status: 422 }),
  );
  const user = userEvent.setup();
  render(<HomePage />);
  upload();
  await screen.findByText('part.stl');
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('не вписываются');
  });
  expect(screen.getByText('part.stl')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled();
});

it('показывает варианты за ограничениями и допускает только явный запуск с моделью', async () => {
  const limited = structuredClone(response);
  if (limited.candidates[1]) limited.candidates[1].meetsConstraints = false;
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(limited)));
  const user = userEvent.setup();
  render(<HomePage />);
  const form = screen.getByRole('button', { name: 'Запустить оптимизацию' }).closest('form');
  if (!form) throw new Error('Missing form');
  fireEvent.submit(form);
  await screen.findByRole('alert');
  upload();
  await screen.findByText('part.stl');
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await screen.findByRole('table');
  expect(screen.getByText('За ограничениями')).toBeVisible();
});

it('числовые поля сбрасывают результат при шаге стрелкой и отправляют десятичное значение из ввода с запятой', async () => {
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify(response))),
  );
  const user = userEvent.setup();
  render(<HomePage />);
  upload();
  await screen.findByText('part.stl');
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await screen.findByRole('table');
  const perimeters = screen.getByLabelText('Минимум периметров');
  await user.click(perimeters);
  await user.keyboard('{ArrowUp}');
  expect(perimeters).toHaveValue('3');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.type(screen.getByLabelText('Максимальное время, мин'), '1500,5');
  await user.click(screen.getByRole('button', { name: 'Запустить оптимизацию' }));
  await screen.findByRole('table');
  expect(fetch).toHaveBeenCalledTimes(2);
  const options = vi.mocked(fetch).mock.calls[1]?.[1];
  expect((options?.body as FormData).get('minimumPerimeters')).toBe('3');
  expect((options?.body as FormData).get('maxPrintTimeMin')).toBe('1500.5');
});
