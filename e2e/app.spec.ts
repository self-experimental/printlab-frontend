import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

test('деморезультат, смена темы и проверка формы', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Материал', { exact: true }).selectOption('PETG');
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByText('Параметры вашего запроса').click();
  await expect(page.getByText(/PETG · 100 Н/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Включить светлую тему' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel('Максимальная нагрузка, Н').fill('-10');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('загрузка STL и обработка повреждённого файла', async ({ page }) => {
  await page.goto('/');
  const upload = page.getByLabel('Выберите STL-модель');
  const valid =
    'solid x facet normal 0 0 1 outer loop vertex 0 0 0 vertex 1 0 0 vertex 0 1 0 endloop endfacet endsolid x';
  await upload.setInputFiles({
    name: 'triangle.stl',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from(valid),
  });
  await expect(page.getByText('triangle.stl', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('успешно');
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Удалить' }).click();
  await expect(page.getByText('МОДЕЛЬ', { exact: true })).toBeVisible();
  await upload.setInputFiles({
    name: 'broken.stl',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('broken'),
  });
  await expect(page.getByRole('alert')).toContainText('Не удалось');
});
