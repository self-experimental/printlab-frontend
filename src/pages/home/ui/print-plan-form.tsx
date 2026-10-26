import { Accordion, Alert, Button, Select, NumberInput, Paper, Textarea } from '@mantine/core';
import { useState, type SyntheticEvent } from 'react';
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
  const [materialId, setMaterialId] = useState<string | null>(null);
  const supported =
    !materialId || (materials.selected && supportedFamilies.has(materials.selected.family));
  const auto = { value: '', label: 'Автоматически' };
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
        <Textarea
          label="Для чего нужна деталь?"
          name="description"
          autosize
          minRows={3}
          maxRows={7}
          maxLength={2000}
          classNames={{ description: styles['home-page__field-description'] }}
          description="Опишите назначение и условия использования. Незаданные параметры подберём автоматически."
          placeholder="Например: держатель наушников под столом, крепится двумя винтами. Важнее надёжность, чем внешний вид."
        />
        <Select
          label="Материал"
          name="materialProfileId"
          mt="md"
          value={materialId}
          disabled={!materials.catalog}
          placeholder={
            materials.error
              ? 'Список недоступен'
              : !materials.catalog
                ? 'Загружаем материалы…'
                : 'Подобрать по описанию'
          }
          onChange={(value) => {
            setMaterialId(value === '' ? null : value);
            if (value) materials.select(value);
            onChange();
          }}
          data={[
            { value: '', label: 'Подобрать по описанию' },
            ...(materials.catalog?.materials ?? []).map((material) => ({
              value: material.id,
              label: `${material.name}${!supportedFamilies.has(material.family) ? ' — пока нет профиля' : ''}`,
              disabled: !supportedFamilies.has(material.family),
            })),
          ]}
        />
        <Accordion variant="contained" mt="md">
          <Accordion.Item value="manual">
            <Accordion.Control>Настроить параметры вручную</Accordion.Control>
            <Accordion.Panel>
              <div className={styles['home-page__fields']}>
                <Select
                  label="Приоритет подбора"
                  name="priority"
                  defaultValue=""
                  onChange={onChange}
                  data={[
                    auto,
                    { value: 'BALANCED', label: 'Баланс времени и расхода' },
                    { value: 'MIN_MATERIAL', label: 'Минимальный расход материала' },
                    { value: 'MIN_TIME', label: 'Минимальное время печати' },
                  ]}
                />
                <Select
                  label="Качество поверхности"
                  name="layerHeightMm"
                  defaultValue=""
                  onChange={onChange}
                  data={[
                    auto,
                    { value: '0.12', label: 'Детальное · слой до 0,12 мм' },
                    { value: '0.2', label: 'Обычное · слой до 0,2 мм' },
                    { value: '0.28', label: 'Быстрое · слой до 0,28 мм' },
                  ]}
                />
                <Select
                  label="Тип заполнения"
                  name="infillPattern"
                  defaultValue=""
                  onChange={onChange}
                  data={[
                    auto,
                    { value: 'GYROID', label: 'Гироид' },
                    { value: 'RECTILINEAR', label: 'Прямолинейное' },
                    { value: 'GRID', label: 'Сетка' },
                    { value: 'CUBIC', label: 'Кубическое' },
                  ]}
                />
                <Select
                  label="Поддержки"
                  name="supportMode"
                  defaultValue=""
                  onChange={onChange}
                  data={[
                    auto,
                    { value: 'AUTO', label: 'Подобрать автоматически' },
                    { value: 'NONE', label: 'Без поддержек' },
                  ]}
                />
                <NumberInput
                  label="Минимальное заполнение, %"
                  name="minimumInfillPercent"
                  onChange={onChange}
                  allowDecimal={false}
                  min={5}
                  max={80}
                  step={1}
                  placeholder="Автоматически"
                />
                <NumberInput
                  label="Минимум периметров"
                  name="minimumPerimeters"
                  onChange={onChange}
                  allowDecimal={false}
                  min={2}
                  max={6}
                  step={1}
                  placeholder="Автоматически"
                />
                <NumberInput
                  label="Верхние сплошные слои"
                  name="topLayers"
                  onChange={onChange}
                  allowDecimal={false}
                  min={3}
                  max={8}
                  step={1}
                  placeholder="Автоматически"
                />
                <NumberInput
                  label="Нижние сплошные слои"
                  name="bottomLayers"
                  onChange={onChange}
                  allowDecimal={false}
                  min={3}
                  max={8}
                  step={1}
                  placeholder="Автоматически"
                />
                <NumberInput
                  label="Максимальное время, мин"
                  name="maxPrintTimeMin"
                  onChange={onChange}
                  min={0.1}
                  max={1000000}
                  step={0.1}
                  placeholder="Без ограничения"
                />
                <NumberInput
                  label="Максимальный расход, г"
                  name="maxMaterialConsumptionG"
                  onChange={onChange}
                  min={0.1}
                  max={1000000}
                  step={0.1}
                  placeholder="Без ограничения"
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        {materials.error && (
          <Alert color="red" className={styles['home-page__calculation-error']}>
            <p>{materials.error}</p>
            <Button variant="light" color="red" type="button" onClick={materials.retry}>
              Загрузить список заново
            </Button>
          </Alert>
        )}
        {materialId && materials.selected && <MaterialDetails material={materials.selected} />}
        <PrimaryButton
          type="submit"
          loading={loading}
          className={styles['home-page__run']}
          disabled={loading || !hasModel || calculated || !materials.catalog || !supported}
        >
          {loading ? 'Сравниваем варианты…' : calculated ? 'Расчёт готов' : 'Запустить оптимизацию'}
        </PrimaryButton>
        <p className={styles['home-page__calculation-hint']}>
          {!hasModel
            ? 'Сначала выберите STL-модель.'
            : calculated
              ? 'Измените описание или параметры, чтобы выполнить новый подбор.'
              : 'Подберём настройки и объясним выбор в результатах. Файл отправится только по кнопке.'}
        </p>
      </form>
    </Paper>
  );
}
