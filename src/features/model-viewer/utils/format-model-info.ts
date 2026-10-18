import type { Model } from '../stl';
export function formatModelInfo(model: Model): string {
  return `${model.triangles.length.toLocaleString('ru-RU')} граней · размер ${model.dimensions.map((value) => value.toFixed(1)).join(' × ')} ед. STL`;
}
