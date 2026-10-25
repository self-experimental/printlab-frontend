import { Alert, Button, Select, NumberInput, Paper } from '@mantine/core';
import type { SyntheticEvent } from 'react';
import { useMaterialCatalog } from '@/features/materials/hooks/use-material-catalog';
import { MaterialDetails } from '@/features/materials/ui/material-details';
import { supportedFamilies } from '@/features/print-plan/model/types';
import { PrimaryButton } from './primary-button';
import styles from '../styles/home-page.module.css';

interface PrintPlanFormProps {
  loading: boolean;
  hasModel: boolean;
  calculated: boolean;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onChange: () => void;
}
export function PrintPlanForm({
  loading,
  hasModel,
  calculated,
  onSubmit,
  onChange,
}: PrintPlanFormProps) {
  const materials = useMaterialCatalog();
  const supported = materials.selected && supportedFamilies.has(materials.selected.family);
  return (
    <Paper
      component="section"
      withBorder
      className={[styles['home-page__panel'], styles['home-page__panel--parameters']].join(' ')}
      aria-labelledby="parameters-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <h2 id="parameters-heading">Параметры печати</h2>
          <p>Bambu Lab A1 mini · сопло 0,4 мм · текстурированная PEI-пластина</p>
        </div>
      </div>
      <form onSubmit={onSubmit} onChange={onChange}>
        <div className={styles['home-page__fields']}>
          <Select
            label="Материал"
            name="materialProfileId"
            aria-label="Материал"
            value={materials.selected?.id ?? null}
            disabled={!materials.catalog}
            placeholder={materials.error ? 'Список недоступен' : 'Загружаем материалы…'}
            onChange={(value) => {
              if (value) materials.select(value);
              onChange();
            }}
            data={(materials.catalog?.materials ?? []).map((material) => ({
              value: material.id,
              label: `${material.name}${!supportedFamilies.has(material.family) ? ' — пока нет профиля' : ''}`,
              disabled: !supportedFamilies.has(material.family),
            }))}
          />
          <Select
            label="Приоритет подбора"
            name="priority"
            defaultValue="BALANCED"
            onChange={onChange}
            data={[
              { value: 'BALANCED', label: 'Баланс времени и расхода' },
              { value: 'MIN_MATERIAL', label: 'Минимальный расход материала' },
              { value: 'MIN_TIME', label: 'Минимальное время печати' },
            ]}
          />
          <Select
            label="Качество поверхности"
            name="layerHeightMm"
            defaultValue="0.2"
            onChange={onChange}
            data={[
              { value: '0.12', label: 'Детальное · слой до 0,12 мм' },
              { value: '0.2', label: 'Обычное · слой до 0,2 мм' },
              { value: '0.28', label: 'Быстрое · слой до 0,28 мм' },
            ]}
          />
          <Select
            label="Поддержки"
            name="supportMode"
            defaultValue="AUTO"
            onChange={onChange}
            data={[
              { value: 'AUTO', label: 'Подобрать автоматически' },
              { value: 'NONE', label: 'Без поддержек' },
            ]}
          />
          <NumberInput
            label="Минимальное заполнение, %"
            aria-label="Минимальное заполнение, %"
            onChange={onChange}
            name="minimumInfillPercent"
            allowDecimal={false}

            min={5}
            max={80}
            step={1}
            defaultValue="15"
            required
          />
          <NumberInput
            label="Минимум периметров"
            aria-label="Минимум периметров"
            onChange={onChange}
            name="minimumPerimeters"
            allowDecimal={false}

            min={2}
            max={6}
            step={1}
            defaultValue="2"
            required
          />
          <NumberInput
            label="Максимальное время, мин"
            aria-label="Максимальное время, мин"
            onChange={onChange}
            name="maxPrintTimeMin"

            min={0.1}
            max={1000000}
            step={0.1}
            placeholder="Без ограничения"
          />
          <NumberInput
            label="Максимальный расход, г"
            aria-label="Максимальный расход, г"
            onChange={onChange}
            name="maxMaterialConsumptionG"

            min={0.1}
            max={1000000}
            step={0.1}
            placeholder="Без ограничения"
          />
        </div>
        {materials.error && (
          <Alert color="red" className={styles['home-page__calculation-error']}>
            <p>{materials.error}</p>
            <Button variant="light" color="red" type="button" onClick={materials.retry}>
              Загрузить список заново
            </Button>
          </Alert>
        )}
        {materials.selected && <MaterialDetails material={materials.selected} />}
        <PrimaryButton
          type="submit"
          loading={loading}
          className={styles['home-page__run']}
          disabled={loading || !hasModel || calculated || !supported}
        >
          {loading ? 'Сравниваем варианты…' : calculated ? 'Расчёт готов' : 'Запустить оптимизацию'}
        </PrimaryButton>
        <p className={styles['home-page__calculation-hint']}>
          {!hasModel
            ? 'Сначала выберите STL-модель.'
            : calculated
              ? 'Измените параметры, чтобы выполнить новый подбор.'
              : 'Сравним 6 вариантов заполнения, периметров и слоя. Файл отправится только по кнопке.'}
        </p>
      </form>
    </Paper>
  );
}
