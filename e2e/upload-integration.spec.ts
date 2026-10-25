import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.skip(
  process.env.E2E_BACKEND !== '1',
  'Требуется работающий бэкенд: E2E_BACKEND=1 npm run test:e2e',
);

test('локальный выбор без запросов, реальный расчёт и изменение результата при другой нагрузке', async ({
  page,
}, testInfo) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/') && request.method() === 'POST')
      requests.push(request.url());
  });
  await page.goto('/');
  await page.getByLabel('Режим расчёта', { exact: true }).selectOption('LOAD');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/cube-20.stl');
  await expect(page.getByText('cube-20.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByLabel('Максимальная нагрузка, Н').fill('40');
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('40,45 Н', { exact: true })).toBeVisible();
  await expect(page.getByText('13,74 г', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Расчёт готов' })).toBeDisabled();
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain('/api/optimization/analyze-stl');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('optimization-real.png'), fullPage: true });
  await page.getByLabel('Максимальная нагрузка, Н').fill('45');
  await expect(page.getByRole('table')).toHaveCount(0);
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByText('46,58 Н', { exact: true })).toBeVisible();
  await expect(page.getByText('18,72 г', { exact: true })).toBeVisible();
  expect(requests).toHaveLength(2);
  await page.getByRole('button', { name: 'Убрать из просмотра' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  expect(requests).toHaveLength(2);
});

test('отсутствие подходящих вариантов и экспериментальных данных отображается понятно', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Режим расчёта', { exact: true }).selectOption('LOAD');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/cube-20.stl');
  await expect(page.getByText('cube-20.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('Ни один испытанный вариант');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByLabel('Материал', { exact: true }).selectOption('prusament-petg');
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('пока нет данных');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('произвольная модель не получает выдуманную рекомендацию', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Режим расчёта', { exact: true }).selectOption('LOAD');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/triangle.stl');
  await expect(page.getByText('triangle.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('нет подходящих испытаний');
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('сервер отклоняет повреждённую грань с понятной подсказкой', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Режим расчёта', { exact: true }).selectOption('LOAD');
  const broken = Buffer.from(
    'solid x\nfacet normal 0 0 1 outer loop vertex 0 0 0 vertex 1 0 0 vertex 1 0 0 endloop endfacet\nendsolid x',
  );
  await page.getByLabel('Выберите STL-модель').setInputFiles({
    name: 'broken-face.stl',
    mimeType: 'application/octet-stream',
    buffer: broken,
  });
  await expect(page.getByText('broken-face.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('В модели есть повреждённая грань');
  await expect(page.getByRole('alert')).toContainText('экспортируйте STL заново');
});
