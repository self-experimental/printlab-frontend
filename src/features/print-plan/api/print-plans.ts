import { knownUploadError } from '@/shared/api/errors';
import type { PrintPlanRequest, PrintPlanResponse } from '../model/types';

const errors: Record<string, string> = {
  INVALID_PRINT_INPUT:
    'Проверьте параметры печати: выберите качество поверхности, заполнение от 5 до 80% и минимум от 2 до 6 периметров.',
  SLICER_UNAVAILABLE: 'Расчёт печати временно недоступен. Слайсер на сервере ещё не настроен.',
  SLICER_BUSY: 'Сейчас выполняется другой расчёт. Дождитесь его завершения и попробуйте ещё раз.',
  SLICE_TIMEOUT:
    'Не удалось завершить расчёт за отведённое время. Измените параметры печати или повторите позже.',
  SLICE_FAILED:
    'Не удалось подготовить модель к печати. Проверьте её в Bambu Studio и экспортируйте STL заново.',
  MATERIAL_UNSUPPORTED:
    'Для этого материала пока нет профиля A1 mini. Выберите PLA, PETG или TPU 95A.',
  MODEL_DOES_NOT_FIT:
    'В этой ориентации модель не помещается в область печати A1 mini — 180 × 180 × 180 мм. Уменьшите или поверните её в редакторе и экспортируйте STL заново.',
  NO_PRINTABLE_VOLUME:
    'У модели нет замкнутого объёма для печати. Проверьте оболочку в редакторе и экспортируйте STL заново.',
  NO_PRINT_PLAN:
    'Рассчитанные варианты не вписываются в ограничения времени или расхода. Увеличьте ограничения или измените параметры печати.',
};
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
function valid(v: unknown): v is PrintPlanResponse {
  if (!record(v)) return false;
  return (
    text(v.printerName) &&
    positive(v.nozzleDiameterMm) &&
    text(v.bedType) &&
    text(v.materialName) &&
    text(v.engineVersion) &&
    text(v.selectedCandidateId) &&
    typeof v.plannedCandidateCount === 'number' &&
    Number.isInteger(v.plannedCandidateCount) &&
    v.plannedCandidateCount >= 1 &&
    v.plannedCandidateCount <= 12 &&
    text(v.explanation) &&
    Array.isArray(v.warnings) &&
    v.warnings.every((s: unknown) => typeof s === 'string') &&
    Array.isArray(v.candidates) &&
    v.candidates.length > 0 &&
    v.candidates.length <= v.plannedCandidateCount &&
    v.candidates.every(
      (c: unknown) =>
        record(c) &&
        text(c.id) &&
        positive(c.infillPercent) &&
        c.infillPercent <= 100 &&
        positive(c.perimeters) &&
        (c.infillPattern === 'GYROID' || c.infillPattern === 'RECTILINEAR') &&
        positive(c.layerHeightMm) &&
        positive(c.estimatedPrintTimeMin) &&
        positive(c.estimatedMaterialG) &&
        typeof c.meetsConstraints === 'boolean',
    ) &&
    v.candidates.some(
      (c: unknown) => record(c) && c.id === v.selectedCandidateId && c.meetsConstraints === true,
    )
  );
}
export async function calculatePrintPlan(
  file: File,
  request: PrintPlanRequest,
  signal: AbortSignal,
): Promise<PrintPlanResponse> {
  const body = new FormData();
  body.append('file', file);
  for (const [key, value] of Object.entries(request)) body.append(key, String(value));
  const timeout = AbortSignal.any([signal, AbortSignal.timeout(210_000)]);
  let response: Response;
  try {
    response = await fetch('/api/print-plans/analyze-stl', {
      method: 'POST',
      body,
      signal: timeout,
      headers: { Accept: 'application/json' },
    });
  } catch (cause) {
    if (signal.aborted) throw cause;
    throw new Error(
      timeout.aborted
        ? 'Ответ сервера не получен за отведённое время. Повторите расчёт немного позже.'
        : 'Не удалось связаться с сервером. Проверьте подключение и повторите расчёт.',
      { cause },
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = record(data) && typeof data.code === 'string' ? data.code : '';
    const message = Object.hasOwn(errors, code) ? errors[code] : knownUploadError(code);
    throw new Error(
      message ??
        (response.status === 400
          ? 'Проверьте параметры печати и выберите материал.'
          : 'Не удалось рассчитать печать. Попробуйте позже.'),
    );
  }
  if (!valid(data))
    throw new Error(
      'Не удалось прочитать результат подбора. Обновите страницу и попробуйте ещё раз.',
    );
  return data;
}
