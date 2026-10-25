import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import fixture from '@/test/material-catalog.json';
const pla = fixture.materials[0];
if (!pla) throw new Error('Missing PLA fixture');

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture))));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('запрашивает один справочник для одновременных потребителей и кеширует его на час', async () => {
  const { fetchMaterialCatalog } = await import('./materials');
  const [first, second] = await Promise.all([fetchMaterialCatalog(), fetchMaterialCatalog()]);
  expect(first).toEqual(fixture);
  expect(second).toBe(first);
  expect(await fetchMaterialCatalog()).toBe(first);
  expect(fetch).toHaveBeenCalledTimes(1);
  vi.setSystemTime(Date.now() + 3_600_001);
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(fixture)));
  await fetchMaterialCatalog();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('не повторяет неудачный запрос автоматически и разрешает явную повторную попытку', async () => {
  const { fetchMaterialCatalog } = await import('./materials');
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('offline'));
  await expect(fetchMaterialCatalog()).rejects.toThrow('Не удалось загрузить список');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(await fetchMaterialCatalog()).toEqual(fixture);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it.each([500, 404])('объясняет недоступность справочника, HTTP %i', async (status) => {
  const { fetchMaterialCatalog } = await import('./materials');
  vi.mocked(fetch).mockResolvedValueOnce(new Response('internal details', { status }));
  await expect(fetchMaterialCatalog()).rejects.toThrow('Попробуйте ещё раз');
});

it.each([
  null,
  {},
  { schemaVersion: 2, materials: fixture.materials },
  { schemaVersion: 1, materials: [] },
  { ...fixture, materials: [null] },
  { ...fixture, materials: [fixture.materials[0], fixture.materials[0]] },
  ...[
    { densityGcm3: -1 },
    { hdtAt045MpaC: 'hot' },
    { notes: null },
    { source: { ...pla.source, url: 'javascript:alert(1)' } },
    { source: { ...pla.source, sha256: 'unknown' } },
    { source: { ...pla.source, pages: [] } },
    { printing: { ...pla.printing, nozzleTemperatureC: { min: 220, max: 200 } } },
    { printing: { ...pla.printing, hardenedNozzleRequired: 'unknown' } },
    { testSeries: [null] },
    { testSeries: [{ ...pla.testSeries[0], specimenType: 'UNKNOWN' }] },
    { testSeries: [{ ...pla.testSeries[0], conditions: null }] },
    {
      testSeries: [{ ...pla.testSeries[0], conditions: { layerHeightMm: 'thin' } }],
    },
    { testSeries: [{ ...pla.testSeries[0], measurements: [] }] },
    {
      testSeries: [
        {
          ...pla.testSeries[0],
          measurements: [{ property: 'FATIGUE', value: 50 }],
        },
      ],
    },
  ].map((change) => ({ ...fixture, materials: [{ ...fixture.materials[0], ...change }] })),
])('не выдаёт некорректные справочные данные за свойства материала (%#)', async (value) => {
  const { fetchMaterialCatalog } = await import('./materials');
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(value)));
  await expect(fetchMaterialCatalog()).rejects.toThrow('Не удалось загрузить');
});
