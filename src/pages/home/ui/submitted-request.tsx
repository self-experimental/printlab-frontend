import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';
export function SubmittedRequest({ result }: { result: OptimizationResult }) {
  const r = result.request;
  return (
    <details className={styles['home-page__submitted']}>
      <summary>Параметры вашего запроса</summary>
      <p>
        {result.fileName} · {r.material} · {r.requiredLoadN} Н · запас {r.safetyFactor} ·{' '}
        {r.testType}
      </p>
      <p>
        Слой: {r.layerHeightMm || 'подобрать'} · периметры: {r.perimeters || 'подобрать'} ·
        ориентация: {r.printOrientation || 'подобрать'}
      </p>
    </details>
  );
}
