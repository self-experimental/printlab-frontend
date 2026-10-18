import type { OptimizationRequest } from '@/features/optimization/model/types';
import { ResultSummary } from './result-summary';
import { ExperimentChart } from './experiment-chart';
import { ExperimentTable } from './experiment-table';
import styles from '../styles/home-page.module.css';

interface OptimizationResultsProps {
  result: OptimizationRequest | null;
}
export function OptimizationResults(props: OptimizationResultsProps) {
  const { result } = props;
  return (
    <section
      className={[styles['home-page__panel'], styles['home-page__results']].join(' ')}
      aria-labelledby="results-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <span className={styles['home-page__step']}>03 / РЕЗУЛЬТАТ</span>
          <h2 id="results-heading">Результаты оптимизации</h2>
          <p>
            {result
              ? 'Рекомендованные параметры на основе экспериментальных данных'
              : 'Настройте параметры и нажмите «Запустить оптимизацию»'}
          </p>
        </div>
        <span className={styles['home-page__file-badge']}>{result ? 'ДЕМО' : 'ОЖИДАНИЕ'}</span>
      </div>
      {result ? (
        <>
          <div className={styles['home-page__result-grid']}>
            <ResultSummary />
            <ExperimentChart />
            <ExperimentTable />
          </div>
        </>
      ) : (
        <div className={styles['home-page__empty-results']}>
          <span aria-hidden="true">↗</span>
          <div>
            <strong>Здесь появится результат</strong>
            <p>Заполнение, прочность, расход материала и сравнение с экспериментами</p>
          </div>
        </div>
      )}
    </section>
  );
}
