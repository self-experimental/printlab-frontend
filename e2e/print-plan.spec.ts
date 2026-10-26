import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };
import response from '../src/test/print-plan-response.json' with { type: 'json' };
import purposeResponse from '../src/test/purpose-print-plan-response.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/materials', (route) => route.fulfill({ json: catalog }));
});
test('новый режим отправляет STL только по кнопке и показывает оценки без выдуманной нагрузки', async ({
  page,
}, testInfo) => {
  let calculations = 0;
  await page.route('**/api/print-plans/analyze-stl', (route) => {
    calculations++;
    expect(route.request().postData()).toContain('name="priority"\r\n\r\nMIN_TIME');
    expect(route.request().postData()).toContain('name="materialProfileId"\r\n\r\nprusament-pla');
    return route.fulfill({ json: response });
  });
  await page.goto('/');
  await expect(page.getByRole('combobox', { name: 'Режим расчёта', exact: true })).toHaveValue(
    'Параметры печати · A1 mini',
  );
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(page.getByText('stepped-block.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await page
    .getByRole('textbox', { name: 'Для чего нужна деталь?', exact: true })
    .fill('Держатель наушников под столом');
  await page.getByRole('combobox', { name: 'Материал', exact: true }).click();
  await page.getByRole('option', { name: 'Prusament PLA', exact: true }).click();
  await page.getByRole('button', { name: 'Настроить параметры вручную' }).click();
  const priority = page.getByRole('combobox', { name: 'Приоритет подбора', exact: true });
  await priority.focus();
  await priority.press('ArrowDown');
  await expect(page.getByRole('listbox', { name: 'Приоритет подбора', exact: true })).toBeVisible();
  await priority.press('ArrowUp');
  await priority.press('Enter');
  await expect(priority).toHaveValue('Минимальное время печати');
  await expect(priority).toHaveAttribute('aria-expanded', 'false');
  await priority.click();
  await page.getByRole('option', { name: 'Минимальное время печати', exact: true }).click();
  await expect(priority).toHaveValue('Минимальное время печати');
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
  await page.getByRole('combobox', { name: 'Качество поверхности', exact: true }).click();
  await page.getByRole('option', { name: 'Быстрое · слой до 0,28 мм', exact: true }).click();
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
  await page.getByRole('button', { name: 'Настроить параметры вручную' }).click();
  await page.getByLabel('Максимальный расход, г', { exact: true }).fill('0.1');
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('alert')).toContainText('не вписываются', { timeout: 200_000 });
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('описания достаточно для подбора, рекомендации заменяют общие абзацы и обновляются только по кнопке', async ({
  page,
}, testInfo) => {
  let calculations = 0;
  await page.route('**/api/print-plans/analyze-stl', (route) => {
    calculations++;
    const body = route.request().postData() ?? '';
    expect(body).toContain('Держатель наушников под столом');
    for (const name of [
      'minimumInfillPercent',
      'minimumPerimeters',
      'layerHeightMm',
      'materialProfileId',
      'priority',
      'infillPattern',
    ])
      expect(body).not.toContain(`name="${name}"`);
    return route.fulfill({ json: purposeResponse });
  });
  await page.goto('/');
  const description = page.getByRole('textbox', { name: 'Для чего нужна деталь?', exact: true });
  await description.fill('Держатель наушников под столом');
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(
    page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' }),
  ).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  expect(calculations).toBe(0);
  await page.getByRole('button', { name: 'Запустить оптимизацию' }).click();
  await expect(page.getByRole('heading', { name: 'Рекомендации для детали' })).toBeVisible();
  await expect(
    page.getByText(purposeResponse.recommendation.summary, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Выбран лучший из|Расход включает сгенерированные поддержки|Время и расход — оценка Bambu Studio|Прочность и допустимая нагрузка детали в этом режиме/,
    ),
  ).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('purpose-recommendations.png'),
    fullPage: true,
  });
  await description.fill('Держатель наушников под столом, нужен прототип');
  await expect(page.getByRole('heading', { name: 'Рекомендации для детали' })).toHaveCount(0);
  expect(calculations).toBe(1);
});
