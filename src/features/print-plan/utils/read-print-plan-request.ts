import type { PrintPlanRequest } from '../model/types';

export function readPrintPlanRequest(form: HTMLFormElement): PrintPlanRequest {
  const data = new FormData(form);
  const text = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value : '';
  };
  function number(key: string, min = 0, max = 1_000_000) {
    const n = Number(text(key));
    if (!Number.isFinite(n) || n < min || n > max)
      throw new Error('Проверьте числовые параметры печати.');
    return n;
  }
  const priority = text('priority');
  const supportMode = text('supportMode');
  if (priority !== 'MIN_MATERIAL' && priority !== 'MIN_TIME' && priority !== 'BALANCED')
    throw new Error('Выберите приоритет подбора.');
  if (supportMode !== 'AUTO' && supportMode !== 'NONE')
    throw new Error('Выберите настройки поддержек.');
  const layerHeightMm = number('layerHeightMm', 0.12, 0.28);
  const minimumPerimeters = number('minimumPerimeters', 2, 6);
  const minimumInfillPercent = number('minimumInfillPercent', 5, 80);
  if (
    ![0.12, 0.2, 0.28].includes(layerHeightMm) ||
    !Number.isInteger(minimumPerimeters) ||
    !Number.isInteger(minimumInfillPercent)
  )
    throw new Error('Выберите качество и целое число периметров и процентов заполнения.');
  const materialProfileId = text('materialProfileId');
  if (!materialProfileId) throw new Error('Выберите материал.');
  return {
    materialProfileId,
    priority,
    supportMode,
    layerHeightMm,
    minimumPerimeters,
    minimumInfillPercent,
    maxPrintTimeMin: number('maxPrintTimeMin'),
    maxMaterialConsumptionG: number('maxMaterialConsumptionG'),
  };
}
