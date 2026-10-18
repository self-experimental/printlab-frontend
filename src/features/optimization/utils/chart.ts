import { experiments } from '../model/demo-data';

export function chartX(fill: number): number {
  return 72 + fill * 5.08;
}
export function chartY(strength: number): number {
  return 210 - strength * 0.6;
}
export const experimentPolyline = experiments
  .map(([fill, strength]) => `${String(chartX(fill))},${String(chartY(strength))}`)
  .join(' ');
