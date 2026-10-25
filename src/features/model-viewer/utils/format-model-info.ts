import type { Model } from '../stl';

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export function formatModelInfo(model: Model): string {
  return `${model.dimensions.map((value) => number.format(value)).join(' × ')} мм`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${number.format(bytes)} Б`;
  if (bytes < 1024 * 1024) return `${number.format(bytes / 1024)} КБ`;
  return `${number.format(bytes / (1024 * 1024))} МБ`;
}
