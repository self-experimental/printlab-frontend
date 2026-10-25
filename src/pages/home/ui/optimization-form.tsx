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
    <section
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
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Приоритет подбора
            <select name="priority" defaultValue="MIN_WEIGHT">
              <option value="MIN_WEIGHT">Минимальный расход материала</option>
              <option value="MAX_STRENGTH">Максимальная нагрузка</option>
              <option value="MIN_TIME">Минимальное время печати</option>
              <option value="BALANCED">Баланс прочности и расхода</option>
            </select>
          </label>
          <label>
            Максимальная нагрузка, Н
            <input
              name="requiredLoadN"
              type="number"
              min="0.1"
              max="1000000"
              step="any"
              defaultValue="100"
              required
            />
          </label>
          <label>
            Коэффициент запаса прочности
            <input
              name="safetyFactor"
              type="number"
              min="1"
              max="10"
              step="0.1"
              defaultValue="2"
              required
            />
          </label>
          <label>
            Тип испытания
            <select name="testType" defaultValue="изгиб">
              <option value="изгиб">Изгиб</option>
              <option value="сжатие">Сжатие</option>
            </select>
          </label>
          <label>
            Ориентация печати
            <select name="printOrientation" defaultValue="">
              <option value="">Подобрать</option>
              <option value="горизонтальная">Горизонтальная</option>
              <option value="вертикальная">Вертикальная</option>
            </select>
          </label>
          <label>
            Высота слоя, мм
            <input
              name="layerHeightMm"
              type="number"
              min="0.05"
              max="1"
              step="0.01"
              defaultValue="0.2"
              placeholder="Подобрать"
            />
          </label>
          <label>
            Количество периметров
            <input
              name="perimeters"
              type="number"
              min="1"
              max="20"
              step="1"
              placeholder="Подобрать"
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
    </section>
  );
}
