import type { CSSProperties } from 'react';
import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export function ResultSummary({ result }: { result: OptimizationResult }) {
  const r = result.response;
  return (
    <div className={styles['home-page__summary']}>
      <h3>Подобранные параметры</h3>
      <div className={styles['home-page__metrics']}>
        <div
          className={styles['home-page__ring']}
          style={{ '--infill': `${String(r.recommendedInfillPercent)}%` } as CSSProperties}
        >
          <strong>
            {number.format(r.recommendedInfillPercent)}
            <span>%</span>
          </strong>
        </div>
        <div className={styles['home-page__metric-pair']}>
          <div>
            <span className={styles['home-page__metric-label']}>Нагрузка с запасом</span>
            <strong className={styles['home-page__metric-value']}>
              {r.loadCapacityN === null ? 'Нет данных' : `${number.format(r.loadCapacityN)} Н`}
            </strong>
          </div>
          <div>
            <span className={styles['home-page__metric-label']}>Расход материала</span>
            <strong className={styles['home-page__metric-value']}>
              {number.format(r.expectedMaterialConsumptionG)} г
            </strong>
          </div>
        </div>
      </div>
      <dl>
        <div>
          <dt>Образец</dt>
          <dd>{r.matchedModelName}</dd>
        </div>
        <div>
          <dt>Тип заполнения</dt>
          <dd>{r.recommendedInfillPattern}</dd>
        </div>
        <div>
          <dt>Высота слоя</dt>
          <dd>{number.format(r.recommendedLayerHeightMm)} мм</dd>
        </div>
        <div>
          <dt>Периметры</dt>
          <dd>{r.recommendedPerimeters}</dd>
        </div>
        <div>
          <dt>Ориентация</dt>
          <dd>{r.recommendedOrientation}</dd>
        </div>
        <div>
          <dt>Время печати</dt>
          <dd>{number.format(r.expectedPrintTimeMin)} мин</dd>
        </div>
      </dl>
    </div>
  );
}
