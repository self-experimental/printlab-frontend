import { expect, it } from 'vitest';
import { readPrintPlanRequest } from './read-print-plan-request';
const values = {
  materialProfileId: 'prusament-pla',
  priority: 'BALANCED',
  supportMode: 'AUTO',
  layerHeightMm: '0.2',
  minimumInfillPercent: '15',
  minimumPerimeters: '2',
};
function form(overrides: Record<string, string> = {}) {
  const form = document.createElement('form');
  for (const [name, value] of Object.entries({ ...values, ...overrides })) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    form.append(input);
  }
  return form;
}
it('считывает параметры и оставляет пустые ограничения без ограничения', () => {
  expect(readPrintPlanRequest(form())).toEqual({
    ...values,
    layerHeightMm: 0.2,
    minimumInfillPercent: 15,
    minimumPerimeters: 2,
    maxPrintTimeMin: 0,
    maxMaterialConsumptionG: 0,
  });
});
it.each([
  { priority: 'MAX_STRENGTH' },
  { supportMode: '' },
  { materialProfileId: '' },
  { minimumPerimeters: '1' },
  { minimumPerimeters: '2.5' },
  { minimumInfillPercent: 'NaN' },
  { minimumInfillPercent: '14.5' },
  { layerHeightMm: '.18' },
  { maxPrintTimeMin: '-1' },
])('не передаёт некорректные параметры %j', (change) => {
  expect(() => readPrintPlanRequest(form(change))).toThrow();
});
