import { Alert, Loader, Paper } from '@mantine/core';
import type { OptimizationResult } from '@/features/optimization/model/types';
import { ResultSummary } from './result-summary';
import { ExperimentChart } from './experiment-chart';
import { ExperimentTable } from './experiment-table';
import styles from '../styles/home-page.module.css';
interface OptimizationResultsProps {
  result: OptimizationResult | null;
  loading: boolean;
  error: string;
}
export function OptimizationResults({ result, loading, error }: OptimizationResultsProps) {
  return (
    <Paper
      component="section"
      withBorder
      className={[styles['home-page__panel'], styles['home-page__results']].join(' ')}
      aria-labelledby="results-heading"
      aria-busy={loading}
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <h2 id="results-heading">Результаты подбора</h2>
          <p>
            {result
              ? 'По данным физических испытаний'
              : 'Выберите модель и запустите подбор параметров'}
          </p>
        </div>
      </div>
      {loading ? (
        <div className={styles['home-page__empty-results']} role="status">
          <Loader size="sm" style={{ flexShrink: 0 }} />
          <p>Проверяем модель и подбираем параметры…</p>
        </div>
      ) : error ? (
        <Alert color="red" className={styles['home-page__calculation-error']}>
          <p>{error}</p>
        </Alert>
      ) : result ? (
        <>
          <div className={styles['home-page__result-grid']}>
            <ResultSummary result={result} />
            <ExperimentChart result={result} />
            <ExperimentTable result={result} />
          </div>
          <div className={styles['home-page__result-notes']}>
            <p>{result.response.explanation}</p>
            {result.response.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        </>
      ) : (
        <div className={styles['home-page__empty-results']}>
          <span aria-hidden="true">↗</span>
          <div>
            <strong>Здесь появится результат</strong>
            <p>Заполнение, нагрузка, расход материала и сравнение с испытанными вариантами</p>
          </div>
        </div>
      )}
    </Paper>
  );
}
