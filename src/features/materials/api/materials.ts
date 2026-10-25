import type { MaterialCatalog } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const optionalNumber = (value: unknown) => value === null || number(value);
const strings = (value: unknown) => Array.isArray(value) && value.every(text);
function range(value: unknown) {
  return isRecord(value) && number(value.min) && number(value.max) && value.min <= value.max;
}
function validCatalog(value: unknown): value is MaterialCatalog {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.materials) ||
    !value.materials.length
  )
    return false;
  const ids = new Set<unknown>();
  return value.materials.every((m: unknown) => {
    if (!isRecord(m) || !text(m.id) || ids.has(m.id)) return false;
    ids.add(m.id);
    const s = m.source;
    const p = m.printing;
    return (
      text(m.family) &&
      text(m.name) &&
      text(m.manufacturer) &&
      number(m.densityGcm3) &&
      m.densityGcm3 > 0 &&
      text(m.densityMethod) &&
      optionalNumber(m.hdtAt045MpaC) &&
      optionalNumber(m.hdtAt180MpaC) &&
      strings(m.notes) &&
      isRecord(s) &&
      text(s.title) &&
      text(s.url) &&
      /^https:\/\/[^/]+\//.test(s.url) &&
      text(s.version) &&
      text(s.publishedOn) &&
      text(s.verifiedOn) &&
      text(s.sha256) &&
      /^[0-9a-f]{64}$/.test(s.sha256) &&
      Array.isArray(s.pages) &&
      s.pages.length > 0 &&
      s.pages.every(number) &&
      isRecord(p) &&
      range(p.nozzleTemperatureC) &&
      range(p.bedTemperatureC) &&
      range(p.coolingFanPercent) &&
      number(p.maxPrintSpeedMmS) &&
      (p.hardenedNozzleRequired === null || typeof p.hardenedNozzleRequired === 'boolean') &&
      Array.isArray(m.testSeries) &&
      m.testSeries.length > 0 &&
      m.testSeries.every((series: unknown) => {
        if (
          !isRecord(series) ||
          !text(series.id) ||
          !text(series.specimenDescription) ||
          !['PRINTED', 'INJECTION_MOLDED'].includes(String(series.specimenType))
        )
          return false;
        const c = series.conditions;
        if (
          c !== null &&
          (!isRecord(c) ||
            !text(c.printer) ||
            !text(c.slicer) ||
            !text(c.infillPattern) ||
            !strings(c.notes) ||
            ![
              'layerHeightMm',
              'perimeters',
              'infillPercent',
              'topLayers',
              'bottomLayers',
              'infillPrintSpeedMmS',
              'nozzleTemperatureC',
              'bedTemperatureC',
            ].every((key) => number(c[key])) ||
            !['nozzleDiameterMm', 'extrusionMultiplier', 'coolingFanPercent'].every((key) =>
              optionalNumber(c[key]),
            ))
        )
          return false;
        if (series.specimenType === 'PRINTED' && c === null) return false;
        return (
          Array.isArray(series.measurements) &&
          series.measurements.length > 0 &&
          series.measurements.every(
            (v: unknown) =>
              isRecord(v) &&
              [
                'TENSILE_YIELD_STRENGTH',
                'TENSILE_STRENGTH',
                'TENSILE_MODULUS',
                'FLEXURAL_STRENGTH',
              ].includes(String(v.property)) &&
              number(v.value) &&
              optionalNumber(v.uncertainty) &&
              v.unit === 'MPa' &&
              text(v.method) &&
              ['HORIZONTAL', 'VERTICAL_XZ', 'UNSPECIFIED'].includes(String(v.direction)),
          )
        );
      })
    );
  });
}

let cached: { value: MaterialCatalog; expires: number } | undefined;
let pending: Promise<MaterialCatalog> | undefined;

/** One shared request per hour; no polling or automatic retries, including in StrictMode. */
export async function fetchMaterialCatalog(): Promise<MaterialCatalog> {
  if (cached && cached.expires > Date.now()) return cached.value;
  pending ??= (async () => {
    const response = await fetch('/api/materials', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('catalog unavailable');
    const data: unknown = await response.json();
    if (!validCatalog(data)) throw new Error('invalid catalog');
    cached = { value: data, expires: Date.now() + 3_600_000 };
    return data;
  })()
    .catch(() => {
      throw new Error('Не удалось загрузить список материалов. Попробуйте ещё раз.');
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
