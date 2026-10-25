import type { OptimizationResult } from '../model/types';
export function buildExperimentChart(result: OptimizationResult) {
  const samples = result.response.experiments
    .filter((row) => row.failureLoadN !== null)
    .map((row) => ({
      id: row.id,
      fill: row.infillPercent,
      capacity: (row.failureLoadN ?? 0) / result.request.safetyFactor,
    }));
  const max = Math.max(
    1,
    Math.ceil(Math.max(result.request.requiredLoadN, ...samples.map((row) => row.capacity)) * 1.1),
  );
  const x = (fill: number) => 72 + fill * 5.08;
  const y = (capacity: number) => 210 - (capacity / max) * 170;
  return { samples, max, x, y };
}
