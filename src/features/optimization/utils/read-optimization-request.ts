import type { OptimizationPriority, OptimizationRequest } from '../model/types';

export function readOptimizationRequest(form: HTMLFormElement): OptimizationRequest {
  const values = new FormData(form);
  function text(name: string) {
    const value = values.get(name);
    return typeof value === 'string' ? value.trim() : '';
  }
  function number(name: string, min = 0, max = 1_000_000) {
    const value = Number(text(name));
    if (!Number.isFinite(value) || value < min || value > max)
      throw new Error('Проверьте числовые параметры расчёта.');
    return value;
  }
  const priority = text('priority');
  if (!['MIN_WEIGHT', 'MIN_TIME', 'MAX_STRENGTH', 'BALANCED'].includes(priority))
    throw new Error('Выберите приоритет подбора.');
  return {
    material: text('material'),
    ...(text('materialProfileId') ? { materialProfileId: text('materialProfileId') } : {}),
    requiredLoadN: number('requiredLoadN', 0.1),
    safetyFactor: number('safetyFactor', 1, 10),
    maxPrintTimeMin: number('maxPrintTimeMin'),
    maxMaterialConsumptionG: number('maxMaterialConsumptionG'),
    layerHeightMm: number('layerHeightMm', 0, 1),
    perimeters: number('perimeters', 0, 20),
    infillPattern: text('infillPattern'),
    printOrientation: text('printOrientation'),
    testType: text('testType'),
    priority: priority as OptimizationPriority,
  };
}
