import type { OptimizationRequest } from '../model/types';

export function readOptimizationRequest(
  form: HTMLFormElement,
  fileName: string,
): OptimizationRequest {
  const values = new FormData(form);
  return {
    material: values.get('material') as string,
    load: Number(values.get('load')),
    factor: Number(values.get('factor')),
    layer: values.get('layer') as string,
    walls: values.get('walls') as string,
    priority: values.get('priority') as string,
    orientation: values.get('orientation') as string,
    requirements: values.getAll('requirements') as string[],
    file: fileName || 'Пример модели',
  };
}
