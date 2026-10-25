import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/materials', (route) => route.fulfill({ json: catalog }));
});

test('production-сборка открывает PrintLab без ошибок JavaScript', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('PrintLab');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Меньше материала.');
  await expect(page.getByText('Здесь появится результат')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('прямая ссылка на неизвестный маршрут открывает 404 и возврат домой', async ({ page }) => {
  await page.goto('/unknown-page');
  await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('link', { name: 'На главную' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Меньше материала.');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('форма не делает запросов без модели и поддерживает смену темы', async ({ page }) => {
  const api: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/') && request.method() === 'POST') api.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Запустить оптимизацию' })).toBeDisabled();
  await page.getByLabel('Материал', { exact: true }).selectOption('prusament-petg');
  expect(api).toEqual([]);
  await page.getByRole('button', { name: 'Включить светлую тему' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('локальный просмотр STL и понятная ошибка повреждённого файла', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/') && request.method() === 'POST')
      requests.push(request.url());
  });
  await page.goto('/');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/triangle.stl');
  await expect(page.getByText('triangle.stl', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Модель открыта.');
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Убрать из просмотра' }).click();
  await expect(page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' })).toHaveCount(0);
  await page.getByLabel('Выберите STL-модель').setInputFiles({
    name: 'broken.stl',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('broken'),
  });
  await expect(page.getByRole('alert')).toContainText('Не удалось');
  expect(requests).toEqual([]);
});
