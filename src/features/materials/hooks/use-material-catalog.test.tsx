import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useMaterialCatalog } from './use-material-catalog';
import { fetchMaterialCatalog } from '../api/materials';
import type { MaterialCatalog } from '../model/types';
import fixture from '@/test/material-catalog.json';

vi.mock('../api/materials', () => ({ fetchMaterialCatalog: vi.fn() }));
const catalog = fixture as MaterialCatalog;
const petg = catalog.materials[1];
if (!petg) throw new Error('Missing PETG fixture');
beforeEach(() => {
  vi.mocked(fetchMaterialCatalog).mockReset().mockResolvedValue(catalog);
});

it('загружает список, поддерживает смену материала без повторного запроса', async () => {
  const { result } = renderHook(useMaterialCatalog);
  await waitFor(() => {
    expect(result.current.selected?.family).toBe('PLA');
  });
  act(() => {
    result.current.select('prusament-tpu-95a');
  });
  expect(result.current.selected?.densityGcm3).toBe(1.25);
  expect(fetchMaterialCatalog).toHaveBeenCalledTimes(1);
});
it('объясняет ошибку и восстанавливает список после нажатия повторить', async () => {
  vi.mocked(fetchMaterialCatalog).mockRejectedValueOnce(new Error('Недоступно'));
  const { result } = renderHook(useMaterialCatalog);
  await waitFor(() => {
    expect(result.current.error).toBe('Недоступно');
  });
  act(() => {
    result.current.retry();
  });
  await waitFor(() => {
    expect(result.current.selected?.family).toBe('PLA');
  });
  expect(result.current.error).toBe('');
});
it('выбирает первый материал в пользовательском каталоге без PLA и игнорирует ответ после ухода', async () => {
  vi.mocked(fetchMaterialCatalog).mockResolvedValueOnce({
    schemaVersion: 1,
    materials: [petg],
  });
  const { result, unmount } = renderHook(useMaterialCatalog);
  await waitFor(() => {
    expect(result.current.selected?.family).toBe('PETG');
  });
  unmount();
  let finish: (value: MaterialCatalog) => void = () => undefined;
  vi.mocked(fetchMaterialCatalog).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const late = renderHook(useMaterialCatalog);
  late.unmount();
  await act(async () => {
    finish(catalog);
    await Promise.resolve();
  });
  vi.mocked(fetchMaterialCatalog).mockRejectedValueOnce(new Error('late'));
  const failed = renderHook(useMaterialCatalog);
  failed.unmount();
  await act(async () => Promise.resolve());
});
