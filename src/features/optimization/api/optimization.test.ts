import { afterEach, expect, it, vi } from 'vitest';
import { optimizeModel } from './optimization';
import { calculationRequest, calculationResponse } from '@/test/optimization-fixtures';

const file = new File(['stl'], 'cube.stl');
afterEach(() => {
  vi.unstubAllGlobals();
});

it('передаёт исходный STL и все ограничения одним multipart-запросом', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(calculationResponse)));
  vi.stubGlobal('fetch', fetchMock);
  expect(await optimizeModel(file, calculationRequest, new AbortController().signal)).toEqual(
    calculationResponse,
  );
  const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url).toBe('/api/optimization/analyze-stl');
  expect(options.headers).toEqual({ Accept: 'application/json' });
  expect((options.body as FormData).get('file')).toBe(file);
  expect((options.body as FormData).get('priority')).toBe('MIN_WEIGHT');
  expect((options.body as FormData).get('requiredLoadN')).toBe('40');
});

it.each([
  [422, { code: 'INVALID_MATERIAL_PROFILE' }, 'выберите материал ещё раз'],
  [422, { code: 'NO_EXPERIMENTS' }, 'пока нет данных'],
  [422, { code: 'UNKNOWN', message: 'internal details' }, 'Ни один испытанный вариант'],
  [400, { code: 'DEGENERATE_FACE' }, 'повреждённая грань'],
  [400, {}, 'Проверьте параметры'],
  [413, null, '15 МБ'],
  [500, { code: 'DEGENERATE_FACE', message: '/internal/path' }, 'немного позже'],
  [502, 'not json', 'немного позже'],
])('обрабатывает ошибку HTTP %s без технических сообщений', async (status, data, expected) => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(typeof data === 'string' ? data : JSON.stringify(data), { status }),
      ),
  );
  await expect(
    optimizeModel(file, calculationRequest, new AbortController().signal),
  ).rejects.toThrow(expected);
});

it.each([
  null,
  {},
  { ...calculationResponse, recommendedInfillPercent: 101 },
  { ...calculationResponse, experiments: [] },
  { ...calculationResponse, expectedPrintTimeMin: -1 },
  {
    ...calculationResponse,
    experiments: [{ ...calculationResponse.experiments[0], failureLoadN: 'invalid' }],
  },
])('не показывает неподтверждённый результат %j', async (data) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));
  await expect(
    optimizeModel(file, calculationRequest, new AbortController().signal),
  ).rejects.toThrow('прочитать результат');
});

it('объясняет сетевой сбой и сохраняет отмену вызывающей стороны', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network error')));
  await expect(
    optimizeModel(file, calculationRequest, new AbortController().signal),
  ).rejects.toThrow('Проверьте подключение');
  const abort = new AbortController();
  abort.abort();
  await expect(optimizeModel(file, calculationRequest, abort.signal)).rejects.toThrow(
    'network error',
  );
});

it('ограничивает ожидание минутой без автоматических повторов', async () => {
  const timeout = new AbortController();
  vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal);
  const fetchMock = vi.fn().mockImplementation(
    (_url: string, options: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          reject(new Error('timeout'));
        });
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  const result = optimizeModel(file, calculationRequest, new AbortController().signal);
  timeout.abort();
  await expect(result).rejects.toThrow('не ответил за минуту');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
