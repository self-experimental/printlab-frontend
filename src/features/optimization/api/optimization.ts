import { knownUploadError } from '@/shared/api/errors';
import type { Experiment, OptimizationRequest, OptimizationResponse } from '../model/types';

export const calculationErrors = {
  INVALID_MATERIAL_PROFILE:
    'Список материалов обновился. Обновите страницу и выберите материал ещё раз.',
  MODEL_NOT_SUPPORTED:
    'Для этой модели пока нет подходящих испытаний. Сейчас подбор доступен для исследованных образцов; другую модель можно открыть и посмотреть в 3D.',
  NO_EXPERIMENTS:
    'Для выбранного материала и типа испытания пока нет данных. Выберите другие условия или добавьте результаты испытаний.',
  NO_SUITABLE_CONFIGURATION:
    'Ни один испытанный вариант не подходит под заданные условия. Проверьте нагрузку, запас прочности и ограничения печати.',
  INVALID_CALCULATION_INPUT:
    'Проверьте параметры расчёта: нагрузка должна быть положительной, а коэффициент запаса — от 1 до 10.',
} as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function number(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
function experiment(value: unknown): value is Experiment {
  return (
    record(value) &&
    text(value.id) &&
    text(value.modelId) &&
    text(value.material) &&
    number(value.infillPercent) &&
    value.infillPercent <= 100 &&
    text(value.infillPattern) &&
    number(value.perimeters) &&
    number(value.layerHeightMm) &&
    text(value.printOrientation) &&
    number(value.compressiveStrengthMpa) &&
    number(value.printTimeMin) &&
    number(value.materialConsumptionG) &&
    (value.failureLoadN === null || number(value.failureLoadN)) &&
    text(value.testType)
  );
}
function response(value: unknown): value is OptimizationResponse {
  if (!record(value)) return false;
  return (
    text(value.matchedModelId) &&
    text(value.matchedModelName) &&
    text(value.selectedExperimentId) &&
    number(value.recommendedInfillPercent) &&
    value.recommendedInfillPercent <= 100 &&
    text(value.recommendedInfillPattern) &&
    number(value.recommendedPerimeters) &&
    number(value.recommendedLayerHeightMm) &&
    text(value.recommendedOrientation) &&
    number(value.expectedCompressiveStrengthMpa) &&
    number(value.expectedPrintTimeMin) &&
    number(value.expectedMaterialConsumptionG) &&
    (value.loadCapacityN === null || number(value.loadCapacityN)) &&
    Array.isArray(value.warnings) &&
    value.warnings.every((item: unknown) => typeof item === 'string') &&
    text(value.explanation) &&
    Array.isArray(value.experiments) &&
    value.experiments.every(experiment) &&
    value.experiments.some((item: Experiment) => item.id === value.selectedExperimentId)
  );
}

export async function optimizeModel(
  file: File,
  request: OptimizationRequest,
  signal: AbortSignal,
): Promise<OptimizationResponse> {
  const body = new FormData();
  body.append('file', file);
  for (const [key, value] of Object.entries(request)) body.append(key, String(value));
  const timeout = AbortSignal.any([signal, AbortSignal.timeout(60_000)]);
  let result: Response;
  try {
    result = await fetch('/api/optimization/analyze-stl', {
      method: 'POST',
      body,
      signal: timeout,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(
      timeout.aborted
        ? 'Сервер не ответил за минуту. Попробуйте запустить расчёт ещё раз.'
        : 'Не удалось связаться с сервером. Проверьте подключение и повторите расчёт.',
      { cause: error },
    );
  }
  const data: unknown = await result.json().catch(() => null);
  if (!result.ok) {
    const code = record(data) ? data.code : null;
    const known =
      typeof code === 'string' && Object.hasOwn(calculationErrors, code)
        ? calculationErrors[code as keyof typeof calculationErrors]
        : knownUploadError(code);
    const fallback =
      result.status === 422
        ? calculationErrors.NO_SUITABLE_CONFIGURATION
        : result.status === 413
          ? knownUploadError('FILE_TOO_LARGE')
          : result.status === 400
            ? calculationErrors.INVALID_CALCULATION_INPUT
            : 'Не удалось выполнить расчёт. Попробуйте ещё раз немного позже.';
    throw new Error((result.status < 500 ? known : undefined) ?? fallback);
  }
  if (!response(data))
    throw new Error(
      'Не удалось прочитать результат расчёта. Обновите страницу и попробуйте ещё раз.',
    );
  return data;
}
