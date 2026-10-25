import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import catalog from '../src/test/material-catalog.json' with { type: 'json' };

// Flexible canvas sizing can introduce imperceptible GPU/anti-aliasing differences.
// Compare rendered pixels instead of PNG bytes; geometry must still match exactly
// outside the small per-pixel color tolerance.
function sameRenderedImage(actual: Buffer, expected: Buffer): boolean {
  const a = PNG.sync.read(actual);
  const b = PNG.sync.read(expected);
  return (
    a.width === b.width &&
    a.height === b.height &&
    pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.05 }) === 0
  );
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/materials', (route) => route.fulfill({ json: catalog }));
});
import { BoxGeometry } from 'three';

test.beforeEach(async ({ page }) => {
  const triangles = [
    [0, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
  ];
  const buffer = Buffer.alloc(284);
  buffer.writeUInt32LE(4, 80);
  triangles.forEach((triangle, index) => {
    triangle.forEach((value, axis) => {
      buffer.writeFloatLE(value, 84 + index * 50 + 12 + axis * 4);
    });
  });
  await page.goto('/');
  await page
    .getByLabel('Выберите STL-модель')
    .setInputFiles({ name: 'tetrahedron.stl', mimeType: 'application/octet-stream', buffer });
  await expect(page.getByText('tetrahedron.stl', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
  await expect(
    page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' }).locator('canvas'),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' }),
  ).toHaveAttribute('aria-busy', 'false');
});

test('модель вращается мышью и клавиатурой, масштабируется колесом и сбрасывается', async ({
  page,
}, testInfo) => {
  const surface = page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' });
  const points = () => surface.locator('canvas').screenshot();
  const initial = await points();
  await testInfo.attach('viewer-initial', { body: initial, contentType: 'image/png' });
  await surface.scrollIntoViewIfNeeded();
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error('Область модели не видна');
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y + 45, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await points()).equals(initial)).toBe(false);
  const rotated = await points();
  await surface.press('ArrowUp');
  await expect.poll(async () => (await points()).equals(rotated)).toBe(false);
  const tilted = await points();
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -120);
  await expect.poll(async () => (await points()).equals(tilted)).toBe(false);
  await page.getByRole('button', { name: 'Сбросить вид' }).click();
  await testInfo.attach('viewer-reset', { body: await points(), contentType: 'image/png' });
  await expect.poll(async () => sameRenderedImage(await points(), initial)).toBe(true);
  await expect(page.getByRole('button', { name: 'Каркас' })).toHaveCount(0);
  await expect(page.getByLabel('Ракурс')).toHaveCount(0);
  await expect(surface.locator('text')).toHaveCount(0);
  await expect(page.getByText(/Перетаскивайте для вращения|Облегчённый просмотр/)).toHaveCount(0);
  await expect(page.getByText('Информация…', { exact: true })).toHaveCount(0);
  const remove = page.getByRole('button', { name: 'Убрать из просмотра' });
  const color = await remove.evaluate((button) => getComputedStyle(button).backgroundColor);
  const channels = color.match(/[\d.]+/g)?.map(Number);
  expect(channels).toBeDefined();
  expect(channels?.[0]).toBeGreaterThan((channels?.[1] ?? 0) * 1.5);
  expect(channels?.[0]).toBeGreaterThan((channels?.[2] ?? 0) * 1.5);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('сенсорное вращение и щипок работают на мобильном экране', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!isMobile, 'Сенсорный сценарий');
  const surface = page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' });
  await surface.scrollIntoViewIfNeeded();
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error('Область модели не видна');
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  const points = () => surface.locator('canvas').screenshot();
  const initial = await points();
  const input = await context.newCDPSession(page);
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 0 }],
  });
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + 35, y: y + 30, id: 0 }],
  });
  await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await points()).equals(initial)).toBe(false);
  const rotated = await points();
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: x - 30, y, id: 0 },
      { x: x + 30, y, id: 1 },
    ],
  });
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: x - 70, y, id: 0 },
      { x: x + 70, y, id: 1 },
    ],
  });
  await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await points()).equals(rotated)).toBe(false);
  await input.detach();
});

test('кнопки и шапка помещаются на экранах от 320 пикселей', async ({ page }, testInfo) => {
  for (const width of [320, 390, 650, 1100, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole('button', { name: 'Загрузить модель' })).toBeInViewport();
  }
  await page.screenshot({ path: testInfo.outputPath('stl-controls-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('stl-controls-mobile.png'), fullPage: true });
});

test('внутренние поверхности не просвечивают через закрытый корпус', async ({ page }) => {
  function vertices(size: number): number[] {
    const original = new BoxGeometry(size, size, size);
    const geometry = original.toNonIndexed();
    const result = [...geometry.getAttribute('position').array];
    original.dispose();
    geometry.dispose();
    return result;
  }
  async function show(values: number[], name: string) {
    const count = values.length / 9;
    const buffer = Buffer.alloc(84 + count * 50);
    buffer.writeUInt32LE(count, 80);
    values.forEach((value, i) => {
      buffer.writeFloatLE(value, 84 + Math.floor(i / 9) * 50 + 12 + (i % 9) * 4);
    });
    await page
      .getByLabel('Выберите STL-модель')
      .setInputFiles({ name, mimeType: 'application/octet-stream', buffer });
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    const surface = page.getByRole('img', { name: 'Предпросмотр геометрии STL-модели' });
    await expect(surface.locator('canvas')).toBeVisible();
    await expect(surface).toHaveAttribute('aria-busy', 'false');
    return surface.locator('canvas').screenshot();
  }
  const outer = vertices(1);
  const closed = await show(outer, 'box.stl');
  await show([...outer, ...vertices(0.4)], 'box-with-interior.stl');
  const canvas = page
    .getByRole('img', { name: 'Предпросмотр геометрии STL-модели' })
    .locator('canvas');
  await expect.poll(async () => (await canvas.screenshot()).equals(closed)).toBe(true);
});
