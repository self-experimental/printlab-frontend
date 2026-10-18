import type { OptimizationRequest } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';

interface SubmittedRequestProps {
  result: OptimizationRequest;
}
export function SubmittedRequest(props: SubmittedRequestProps) {
  const { result } = props;
  return (
    <details className={styles['home-page__submitted']}>
      <summary>Параметры вашего запроса</summary>
      <p>
        {result.file} · {result.material} · {result.load} Н · запас {result.factor} · слой{' '}
        {result.layer} мм · {result.walls} периметра
      </p>
      <p>
        {result.priority} · {result.orientation}
      </p>
      <p>Требования: {result.requirements.join(', ') || 'Не выбраны'}</p>
    </details>
  );
}
