import type { PrintPlanRequest } from '../model/types';

export function readPrintPlanRequest(form: HTMLFormElement): PrintPlanRequest {
  const data = new FormData(form);
  const text = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value.trim() : '';
  };
  const description = text('description');
  if (description.length > 2000)
    throw new Error('Описание детали должно быть не длиннее 2000 символов.');
  const result: PrintPlanRequest = { description };
  const material = text('materialProfileId');
  if (material) result.materialProfileId = material;
  const priority = text('priority');
  if (priority) {
    if (priority !== 'MIN_MATERIAL' && priority !== 'MIN_TIME' && priority !== 'BALANCED')
      throw new Error('Выберите приоритет подбора.');
    result.priority = priority;
  }
  const support = text('supportMode');
  if (support) {
    if (support !== 'AUTO' && support !== 'NONE') throw new Error('Выберите настройки поддержек.');
    result.supportMode = support;
  }
  const pattern = text('infillPattern');
  if (pattern) {
    if (
      pattern !== 'GYROID' &&
      pattern !== 'RECTILINEAR' &&
      pattern !== 'GRID' &&
      pattern !== 'CUBIC'
    )
      throw new Error('Выберите тип заполнения.');
    result.infillPattern = pattern;
  }
  for (const [key, min, max, integer] of [
    ['layerHeightMm', 0.12, 0.28, false],
    ['minimumInfillPercent', 5, 80, true],
    ['minimumPerimeters', 2, 6, true],
    ['topLayers', 3, 8, true],
    ['bottomLayers', 3, 8, true],
    ['maxPrintTimeMin', 0, 1000000, false],
    ['maxMaterialConsumptionG', 0, 1000000, false],
  ] as const) {
    const raw = text(key);
    if (!raw) continue;
    const value = Number(raw);
    if (
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value)) ||
      (key === 'layerHeightMm' && ![0.12, 0.2, 0.28].includes(value))
    )
      throw new Error('Проверьте числовые параметры печати.');
    result[key] = value;
  }
  return result;
}
