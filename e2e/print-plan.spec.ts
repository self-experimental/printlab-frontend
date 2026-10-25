import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };
import response from '../src/test/print-plan-response.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/materials', (route) => route.fulfill({ json: catalog }));
});
test('новый режим отправляет STL только по кнопке и показывает оценки без выдуманной нагрузки', async ({
  page,
}, testInfo) => {
  let calculations = 0;
  await page.route('**/api/print-plans/analyze-stl', (route) => {
    calculations++;
    return route.fulfill({ json: response });
  });
  await page.goto('/');
  await expect(page.getByLabel('Режим расчёта')).toHaveValue('PRINT');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(page.getByText('stepped-block.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  expect(calculations).toBe(0);
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('21,97 мин', { exact: true })).toBeVisible();
  await expect(page.getByText('3,49 г', { exact: true })).toBeVisible();
  await expect(page.getByText('Нагрузка с запасом', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Расчёт готов' })).toBeDisabled();
  expect(calculations).toBe(1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('print-plan.png'), fullPage: true });
  await page.getByLabel('Качество поверхности').selectOption('0.28');
  await expect(page.getByRole('table')).toHaveCount(0);
  expect(calculations).toBe(1);
});

test('при занятости сервера разрешает повторить расчёт без автоматических повторов', async ({
  page,
}) => {
  let calculations = 0;
  await page.route('**/api/print-plans/analyze-stl', (route) => {
    calculations++;
    return route.fulfill({ status: 429, json: { code: 'SLICER_BUSY' } });
  });
  await page.goto('/');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(page.getByText('stepped-block.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('другой расчёт');
  expect(calculations).toBe(1);
  await expect(page.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('сохраняет готовые варианты и явно отмечает неполный подбор', async ({ page }, testInfo) => {
  await page.route('**/api/print-plans/analyze-stl', (route) =>
    route.fulfill({ json: { ...response, candidates: response.candidates.slice(0, 5) } }),
  );
  await page.goto('/');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(page.getByText('stepped-block.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('Сравнили 5 из 6 вариантов')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(6);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('partial-print-plan.png'), fullPage: true });
});

test('настоящий Bambu Studio рассчитывает модель вне базы и учитывает ограничения', async ({
  page,
}) => {
  test.skip(
    process.env.E2E_BAMBU !== '1',
    'Нужны локальный бэк и Bambu Studio; E2E_BAMBU=1, --workers=1',
  );
  test.setTimeout(480_000);
  await page.unroute('**/api/materials');
  await page.goto('/');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(page.getByText('stepped-block.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 200_000 });
  await expect(page.getByRole('row')).toHaveCount(7);
  await expect(page.getByText('Рекомендуем', { exact: true })).toBeVisible();
  await page.getByText('Как получен расчёт', { exact: true }).click();
  await expect(page.getByText(/Prusament PLA · Bambu Studio/)).toBeVisible();
  await page.getByLabel('Максимальный расход, г', { exact: true }).fill('0.1');
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('не вписываются', { timeout: 200_000 });
  await expect(page.getByRole('table')).toHaveCount(0);
});
