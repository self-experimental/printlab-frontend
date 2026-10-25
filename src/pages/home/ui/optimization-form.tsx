import { Alert, Button, Select, NumberInput, Paper } from '@mantine/core';
import type { SyntheticEvent } from 'react';
import { PrimaryButton } from './primary-button';
import { useMaterialCatalog } from '@/features/materials/hooks/use-material-catalog';
import { MaterialDetails } from '@/features/materials/ui/material-details';
import styles from '../styles/home-page.module.css';

interface OptimizationFormProps {
  loading: boolean;
  hasModel: boolean;
  calculated: boolean;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onChange: () => void;
}
export function OptimizationForm({
  loading,
  hasModel,
  calculated,
  onSubmit,
  onChange,
}: OptimizationFormProps) {
  const materials = useMaterialCatalog();
  return (
    <Paper
      component="section"
      withBorder
      className={[styles['home-page__panel'], styles['home-page__panel--parameters']].join(' ')}
      aria-labelledby="parameters-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <h2 id="parameters-heading">Параметры подбора</h2>
          <p>Выберите условия и ограничения печати</p>
        </div>
      </div>
      <form onSubmit={onSubmit} onChange={onChange}>
        <input type="hidden" name="material" value={materials.selected?.family ?? ''} />
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
              label: material.name,
            }))}
          />
          <Select
            label="Приоритет подбора"
            name="priority"
            defaultValue="MIN_WEIGHT"
            onChange={onChange}
            data={[
              { value: 'MIN_WEIGHT', label: 'Минимальный расход материала' },
              { value: 'MAX_STRENGTH', label: 'Максимальная нагрузка' },
              { value: 'MIN_TIME', label: 'Минимальное время печати' },
              { value: 'BALANCED', label: 'Баланс прочности и расхода' },
            ]}
          />
          <NumberInput
            label="Максимальная нагрузка, Н"
            aria-label="Максимальная нагрузка, Н"
            onChange={onChange}
            name="requiredLoadN"

            min={0.1}
            max={1000000}
            step={0.1}
            defaultValue="100"
            required
          />
          <NumberInput
            label="Коэффициент запаса прочности"
            aria-label="Коэффициент запаса прочности"
            onChange={onChange}
            name="safetyFactor"

            min={1}
            max={10}
            step={0.1}
            defaultValue="2"
            required
          />
          <Select
            label="Тип испытания"
            name="testType"
            defaultValue="изгиб"
            onChange={onChange}
            data={[
              { value: 'изгиб', label: 'Изгиб' },
              { value: 'сжатие', label: 'Сжатие' },
            ]}
          />
          <Select
            label="Ориентация печати"
            name="printOrientation"
            defaultValue=""
            onChange={onChange}
            data={[
              { value: '', label: 'Подобрать' },
              { value: 'горизонтальная', label: 'Горизонтальная' },
              { value: 'вертикальная', label: 'Вертикальная' },
            ]}
          />
          <NumberInput
            label="Высота слоя, мм"
            aria-label="Высота слоя, мм"
            onChange={onChange}
            name="layerHeightMm"

            min={0.05}
            max={1}
            step={0.01}
            defaultValue="0.2"
            placeholder="Подобрать"
          />
          <NumberInput
            label="Количество периметров"
            aria-label="Количество периметров"
            onChange={onChange}
            name="perimeters"
            allowDecimal={false}

            min={1}
            max={20}
            step={1}
            placeholder="Подобрать"
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
          disabled={loading || !hasModel || calculated || !materials.selected}
        >
          {loading ? 'Подбираем параметры…' : calculated ? 'Расчёт готов' : 'Запустить оптимизацию'}
        </PrimaryButton>
        <p className={styles['home-page__calculation-hint']}>
          {!hasModel
            ? 'Сначала выберите STL-модель.'
            : calculated
              ? 'Измените параметры, чтобы выполнить новый подбор.'
              : 'Файл будет отправлен только при запуске расчёта.'}
        </p>
      </form>
    </Paper>
  );
}
