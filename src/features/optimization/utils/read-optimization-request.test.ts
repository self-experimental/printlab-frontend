import { expect, it } from 'vitest';
import { readOptimizationRequest } from './read-optimization-request';
function form(values: Record<string, string>) {
  const result = document.createElement('form');
  for (const [name, value] of Object.entries(values)) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    result.append(input);
  }
  return result;
}
it('пустые необязательные ограничения оставляет без ограничений', () => {
  const result = readOptimizationRequest(
    form({ material: 'PLA', requiredLoadN: '40', safetyFactor: '2', priority: 'MIN_TIME' }),
  );
  expect(result.perimeters).toBe(0);
  expect(result.maxPrintTimeMin).toBe(0);
  expect(result.requiredLoadN).toBe(40);
});
it('не отправляет неверные значения и неизвестный приоритет', () => {
  expect(() =>
    readOptimizationRequest(form({ requiredLoadN: 'NaN', priority: 'MIN_WEIGHT' })),
  ).toThrow('числовые параметры');
  expect(() => readOptimizationRequest(form({ priority: 'unknown' }))).toThrow('приоритет');
});
