import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { OptimizationForm } from './optimization-form';
import { fetchMaterialCatalog } from '@/features/materials/api/materials';
import type { MaterialCatalog } from '@/features/materials/model/types';
import fixture from '@/test/material-catalog.json';
const pla = fixture.materials[0];
if (!pla) throw new Error('Missing PLA fixture');

vi.mock('@/features/materials/api/materials', () => ({ fetchMaterialCatalog: vi.fn() }));
beforeEach(() => {
  vi.mocked(fetchMaterialCatalog)
    .mockReset()
    .mockResolvedValue(fixture as MaterialCatalog);
});
const props = {
  loading: false,
  hasModel: true,
  calculated: false,
  onSubmit: vi.fn(),
  onChange: vi.fn(),
};

it('показывает материалы с бэка и свойства конкретного продукта по запросу', async () => {
  const user = userEvent.setup();
  render(<OptimizationForm {...props} />);
  await screen.findByRole('option', { name: 'Prusament PLA' });
  expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled();
  expect(screen.getByText('Испытания напечатанных образцов')).not.toBeVisible();
  await user.click(screen.getByText('Свойства материала и источник'));
  expect(screen.getByText('51 ± 3 МПа')).not.toBeVisible();
  await user.click(screen.getByText('Данные испытаний'));
  expect(screen.getByText('51 ± 3 МПа')).toBeVisible();
  expect(screen.getByRole('link', { name: /Паспорт производителя/ })).toHaveAttribute(
    'href',
    pla.source.url,
  );
  await user.selectOptions(screen.getByLabelText('Материал'), 'esun-abs-plus');
  await user.click(screen.getByText('Свойства материала и источник'));
  await user.click(screen.getByText('Данные испытаний'));
  expect(screen.getByText('Испытания литых образцов')).toBeVisible();
  expect(screen.getByText('40 МПа')).toBeVisible();
  expect(screen.queryByText('Условия испытаний:', { exact: false })).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Материал'), 'prusament-pa11-cf');
  await user.click(screen.getByText('Свойства материала и источник'));
  expect(screen.getByText('Закалённое сопло')).toBeVisible();
  expect(fetchMaterialCatalog).toHaveBeenCalledTimes(1);
  const form = screen.getByRole('button', { name: 'Запустить оптимизацию' }).closest('form');
  if (!form) throw new Error('Form missing');
  expect(new FormData(form).get('material')).toBe('PA11_CF');
  expect(new FormData(form).get('materialProfileId')).toBe('prusament-pa11-cf');
});

it('оставляет предварительный просмотр доступным при ошибке справочника и даёт повторить загрузку', async () => {
  vi.mocked(fetchMaterialCatalog).mockRejectedValueOnce(
    new Error('Не удалось загрузить список материалов.'),
  );
  render(<OptimizationForm {...props} />);
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Загрузить список заново' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Запустить оптимизацию' })).toBeEnabled(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
