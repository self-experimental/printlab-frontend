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
    <section
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
          <label>
            Материал
            <select
              name="materialProfileId"
              aria-label="Материал"
              value={materials.selected?.id ?? ''}
              disabled={!materials.catalog}
              onChange={(event) => {
                materials.select(event.currentTarget.value);
              }}
            >
              {!materials.catalog && (
                <option value="">
                  {materials.error ? 'Список недоступен' : 'Загружаем материалы…'}
                </option>
              )}
              {materials.catalog?.materials.map((material) => (
                <option
                  key={material.id}
                  value={material.id}
                  disabled={!supportedFamilies.has(material.family)}
                >
                  {material.name}
                  {!supportedFamilies.has(material.family) && ' — пока нет профиля'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Приоритет подбора
            <select name="priority" defaultValue="BALANCED">
              <option value="BALANCED">Баланс времени и расхода</option>
              <option value="MIN_MATERIAL">Минимальный расход материала</option>
              <option value="MIN_TIME">Минимальное время печати</option>
            </select>
          </label>
          <label>
            Качество поверхности
            <select name="layerHeightMm" defaultValue="0.2">
              <option value="0.12">Детальное · слой до 0,12 мм</option>
              <option value="0.2">Обычное · слой до 0,2 мм</option>
              <option value="0.28">Быстрое · слой до 0,28 мм</option>
            </select>
          </label>
          <label>
            Поддержки
            <select name="supportMode" defaultValue="AUTO">
              <option value="AUTO">Подобрать автоматически</option>
              <option value="NONE">Без поддержек</option>
            </select>
          </label>
          <label>
            Минимальное заполнение, %
            <input
              name="minimumInfillPercent"
              type="number"
              min="5"
              max="80"
              step="1"
              defaultValue="15"
              required
            />
          </label>
          <label>
            Минимум периметров
            <input
              name="minimumPerimeters"
              type="number"
              min="2"
              max="6"
              step="1"
              defaultValue="2"
              required
            />
          </label>
          <label>
            Максимальное время, мин
            <input
              name="maxPrintTimeMin"
              type="number"
              min="0.1"
              max="1000000"
              step="any"
              placeholder="Без ограничения"
            />
          </label>
          <label>
            Максимальный расход, г
            <input
              name="maxMaterialConsumptionG"
              type="number"
              min="0.1"
              max="1000000"
              step="any"
              placeholder="Без ограничения"
            />
          </label>
        </div>
        {materials.error && (
          <div role="alert" className={styles['home-page__calculation-error']}>
            <p>{materials.error}</p>
            <button
              type="button"
              className={styles['home-page__retry-materials']}
              onClick={materials.retry}
            >
              Загрузить список заново
            </button>
          </div>
        )}
        {materials.selected && <MaterialDetails material={materials.selected} />}
        <PrimaryButton
          type="submit"
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
    </section>
  );
}
