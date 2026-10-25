import { afterEach, expect, it, vi } from 'vitest';
import { calculatePrintPlan } from './print-plans';
import type { PrintPlanRequest } from '../model/types';
import fixture from '@/test/print-plan-response.json';
const request: PrintPlanRequest = {
  materialProfileId: 'prusament-pla',
  priority: 'BALANCED',
  supportMode: 'AUTO',
  layerHeightMm: 0.2,
  minimumInfillPercent: 15,
  minimumPerimeters: 2,
  maxPrintTimeMin: 0,
  maxMaterialConsumptionG: 0,
};
const file = new File(['stl'], 'part.stl');
afterEach(() => {
  vi.unstubAllGlobals();
});
it('отправляет один файл и параметры и читает только проверенный результат', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture))));
  expect(await calculatePrintPlan(file, request, new AbortController().signal)).toEqual(fixture);
  const [url, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
  expect(url).toBe('/api/print-plans/analyze-stl');
  expect((options.body as FormData).get('file')).toBe(file);
  expect((options.body as FormData).get('minimumInfillPercent')).toBe('15');
});
it.each([
  [429, 'SLICER_BUSY', 'другой расчёт'],
  [503, 'SLICER_UNAVAILABLE', 'не настроен'],
  [504, 'SLICE_TIMEOUT', 'слишком много времени'],
  [422, 'SLICE_FAILED', 'экспортируйте STL'],
  [422, 'MATERIAL_UNSUPPORTED', 'PLA, PETG'],
  [422, 'MODEL_DOES_NOT_FIT', '180 × 180'],
  [422, 'NO_PRINTABLE_VOLUME', 'замкнутого объёма'],
  [422, 'NO_PRINT_PLAN', 'не вписываются'],
  [400, 'DEGENERATE_FACE', 'повреждённая грань'],
  [400, 'UNKNOWN', 'Проверьте параметры'],
  [500, 'UNKNOWN', 'Попробуйте позже'],
])('показывает понятную ошибку %s %s', async (status, code, message) => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code, message: '/private/internal/path' }), { status }),
      ),
  );
  await expect(calculatePrintPlan(file, request, new AbortController().signal)).rejects.toThrow(
    message,
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});
it.each([
  null,
  {},
  { ...fixture, candidates: [] },
  { ...fixture, candidates: [{ ...fixture.candidates[0], estimatedMaterialG: 0 }] },
  { ...fixture, selectedCandidateId: 'missing' },
])('отклоняет недостоверный ответ %#', async (value) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(value))));
  await expect(calculatePrintPlan(file, request, new AbortController().signal)).rejects.toThrow(
    'прочитать результат',
  );
});
it('объясняет сеть, таймаут и сохраняет отмену запроса без автоматического повтора', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
  await expect(calculatePrintPlan(file, request, new AbortController().signal)).rejects.toThrow(
    'Проверьте подключение',
  );
  const aborted = new AbortController();
  aborted.abort();
  await expect(calculatePrintPlan(file, request, aborted.signal)).rejects.toThrow('network');
  vi.spyOn(AbortSignal, 'timeout').mockReturnValue(aborted.signal);
  await expect(calculatePrintPlan(file, request, new AbortController().signal)).rejects.toThrow(
    'за минуту',
  );
});
