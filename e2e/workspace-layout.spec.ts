import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };

test('рабочая область без лишних надписей, панели выровнены при загрузке модели и раскрытии настроек', async ({
  page,
  isMobile,
}, testInfo) => {
  await page.route('**/api/materials', (route) => route.fulfill({ json: catalog }));
  await page.goto('/');
  await expect(page.getByRole('combobox', { name: 'Материал', exact: true })).toBeEnabled();
  await expect(
    page.getByText(
      /Меньше материала|Больше возможностей|РАБОЧЕЕ ПРОСТРАНСТВО|Исследовательский проект|прототип интерфейса/,
    ),
  ).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toHaveText('PrintLab');

  const model = page.getByRole('region', { name: '3D-модель', exact: true });
  const settings = page.getByRole('region', { name: 'Настройки расчёта', exact: true });
  async function expectAlignedPanels() {
    await expect
      .poll(async () => {
        const [left, right] = await Promise.all([model.boundingBox(), settings.boundingBox()]);
        if (!left || !right) return Infinity;
        if (isMobile) return Math.max(0, left.y + left.height - right.y);
        return Math.max(
          Math.abs(left.y - right.y),
          Math.abs(left.y + left.height - right.y - right.height),
        );
      })
      .toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }

  await expectAlignedPanels();
  await page.getByLabel('Выберите STL-модель').setInputFiles('fixtures/stepped-block.stl');
  await expect(
    page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' }),
  ).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await expectAlignedPanels();
  await page.screenshot({ path: testInfo.outputPath('workspace-aligned.png'), fullPage: true });

  await page.getByRole('button', { name: 'Настроить параметры вручную' }).click();
  await expectAlignedPanels();
  await page.getByRole('combobox', { name: 'Материал', exact: true }).click();
  await page.getByRole('option', { name: 'Prusament PLA', exact: true }).click();
  await page.getByRole('button', { name: 'Свойства материала и источник' }).click();
  await expect(page.getByText('Плотность', { exact: true })).toBeVisible();
  await expectAlignedPanels();
  await page.getByRole('button', { name: 'Данные испытаний', exact: true }).click();
  await expect(page.getByText('Испытания напечатанных образцов')).toBeVisible();
  await expectAlignedPanels();
  await page.getByRole('combobox', { name: 'Режим расчёта', exact: true }).click();
  await page.getByRole('option', { name: 'Нагрузка по испытаниям образцов', exact: true }).click();
  await expect(page.getByLabel('Максимальная нагрузка, Н')).toBeVisible();
  await expectAlignedPanels();
});
