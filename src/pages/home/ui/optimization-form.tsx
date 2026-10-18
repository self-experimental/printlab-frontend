import type { SyntheticEvent } from 'react';
import { PrimaryButton } from './primary-button';
import styles from '../styles/home-page.module.css';

interface OptimizationFormProps {
  loading: boolean;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onChange: () => void;
}
export function OptimizationForm(props: OptimizationFormProps) {
  const { loading, onSubmit, onChange } = props;
  return (
    <section
      className={[styles['home-page__panel'], styles['home-page__panel--parameters']].join(' ')}
      aria-labelledby="parameters-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <span className={styles['home-page__step']}>02 / УСЛОВИЯ</span>
          <h2 id="parameters-heading">Параметры оптимизации</h2>
          <p>Задайте условия эксплуатации и ограничения</p>
        </div>
      </div>
      <form onSubmit={onSubmit} onChange={onChange}>
        <div className={styles['home-page__fields']}>
          <label>
            Материал
            <select aria-label="Материал" name="material" defaultValue="PLA">
              <option>PLA</option>
              <option>PETG</option>
              <option>ABS</option>
            </select>
          </label>
          <fieldset className={styles['home-page__requirements']}>
            <legend>Требования</legend>
            {['Минимальный вес', 'Максимальная прочность', 'Ограничение по времени печати'].map(
              (label, i) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    name="requirements"
                    value={label}
                    defaultChecked={i === 0}
                  />
                  {label}
                </label>
              ),
            )}
          </fieldset>
          <label>
            Максимальная нагрузка, Н
            <input
              name="load"
              type="number"
              min="0.1"
              max="1000000"
              step="any"
              defaultValue="100"
              required
            />
          </label>
          <label>
            Высота слоя, мм
            <input
              name="layer"
              type="number"
              min="0.05"
              max="1"
              step="0.01"
              defaultValue="0.2"
              required
            />
          </label>
          <label>
            Коэффициент запаса прочности
            <input
              name="factor"
              type="number"
              min="1"
              max="10"
              step="0.1"
              defaultValue="2"
              required
            />
          </label>
          <label>
            Количество периметров
            <input name="walls" type="number" min="1" max="20" step="1" defaultValue="3" required />
          </label>
          <label>
            Приоритет оптимизации
            <select name="priority">
              <option>Минимальный расход материала</option>
              <option>Максимальная прочность</option>
              <option>Минимальное время печати</option>
            </select>
          </label>
          <label>
            Ориентация печати
            <select name="orientation">
              <option>Авто</option>
              <option>По оси X</option>
              <option>По оси Y</option>
              <option>По оси Z</option>
            </select>
          </label>
        </div>
        <PrimaryButton type="submit" className={styles['home-page__run']} disabled={loading}>
          Запустить оптимизацию <span aria-hidden="true">→</span>
        </PrimaryButton>
        <p className={styles['home-page__form-hint']}>
          Значения формы сохраняются в примере. Подбор параметров будет доступен после подключения
          API.
        </p>
      </form>
    </section>
  );
}
