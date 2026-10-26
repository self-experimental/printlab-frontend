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
    description: '',
  });
});
it.each([
  { priority: 'MAX_STRENGTH' },
  { supportMode: 'INVALID' },
  { infillPattern: 'INVALID' },
  { topLayers: '2' },
  { bottomLayers: '2.5' },
  { description: 'x'.repeat(2001) },
  { minimumPerimeters: '1' },
  { minimumPerimeters: '2.5' },
  { minimumInfillPercent: 'NaN' },
  { minimumInfillPercent: '14.5' },
  { layerHeightMm: '.18' },
  { maxPrintTimeMin: '-1' },
])('не передаёт некорректные параметры %j', (change) => {
  expect(() => readPrintPlanRequest(form(change))).toThrow();
});

it('оставляет отсутствующие ручные параметры на автоматический подбор', () => {
  const input = form(Object.fromEntries(Object.keys(values).map((key) => [key, ''])));
  const description = document.createElement('textarea');
  description.name = 'description';
  description.value = '  Держатель наушников  ';
  input.append(description);
  expect(readPrintPlanRequest(input)).toEqual({ description: 'Держатель наушников' });
});
it('читает тип заполнения и сплошные слои', () => {
  expect(
    readPrintPlanRequest(form({ infillPattern: 'CUBIC', topLayers: '6', bottomLayers: '5' })),
  ).toMatchObject({ infillPattern: 'CUBIC', topLayers: 6, bottomLayers: 5 });
});
