import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };
const tpu = catalog.materials.find((material) => material.family === 'TPU_95A');
if (!tpu) throw new Error('Missing TPU fixture');

test('материалы приходят с сервера, свойства открываются по желанию без повторных запросов', async ({
  page,
}, testInfo) => {
  let requests = 0;
  await page.route('**/api/materials', (route) => {
    requests++;
    return route.fulfill({ json: catalog });
  });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Режим расчёта', exact: true }).click();
  await page.getByRole('option', { name: 'Нагрузка по испытаниям образцов', exact: true }).click();
  const material = page.getByRole('combobox', { name: 'Материал', exact: true });
  await material.click();
  await expect(page.getByRole('option')).toHaveCount(8);
  await page.getByRole('option', { name: 'Prusament TPU 95A', exact: true }).click();
  await page.getByText('Свойства материала и источник').click();
  await expect(page.getByText('1,25 г/см³', { exact: true })).toBeVisible();
  await page.getByText('Данные испытаний', { exact: true }).click();
  await expect(page.getByText('41,4 ± 1,3 МПа', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Паспорт производителя/ })).toHaveAttribute(
    'href',
    tpu.source.url,
  );
  await expect(page.getByText('563,3')).toHaveCount(0);
  expect(requests).toBe(1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('material-catalog.png'), fullPage: true });
  await material.click();
  await page.getByRole('option', { name: 'eSUN ABS+', exact: true }).click();
  await page.getByText('Свойства материала и источник').click();
  await page.getByText('Данные испытаний', { exact: true }).click();
  await expect(page.getByText('Испытания литых образцов')).toBeVisible();
  expect(requests).toBe(1);
});

test('список восстанавливается только после явной повторной попытки', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/materials', (route) => {
    requests++;
    return requests === 1
      ? route.fulfill({ status: 503, body: 'offline' })
      : route.fulfill({ json: catalog });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить список');
  expect(requests).toBe(1);
  await expect(page.getByRole('button', { name: 'Запустить оптимизацию' })).toBeDisabled();
  await page.getByRole('button', { name: 'Загрузить список заново' }).click();
  await expect(page.getByRole('combobox', { name: 'Материал', exact: true })).toBeEnabled();
  expect(requests).toBe(2);
});
