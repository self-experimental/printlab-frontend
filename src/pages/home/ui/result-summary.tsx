import { RingProgress } from '@mantine/core';
import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export function ResultSummary({ result }: { result: OptimizationResult }) {
  const r = result.response;
  return (
    <div className={styles['home-page__summary']}>
      <h3>Подобранные параметры</h3>
      <div className={styles['home-page__metrics']}>
        <RingProgress
          size={100}
          thickness={8}
          roundCaps
          sections={[{ value: r.recommendedInfillPercent, color: 'teal' }]}
          label={
            <strong style={{ display: 'block', textAlign: 'center' }}>
              {number.format(r.recommendedInfillPercent)}%
            </strong>
          }
        />
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
