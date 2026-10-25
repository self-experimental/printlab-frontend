import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export function ExperimentTable({ result }: { result: OptimizationResult }) {
  return (
    <div className={styles['home-page__table-wrap']}>
      <h3>Испытанные варианты</h3>
      <table>
        <caption>Результаты испытаний сопоставленного образца</caption>
        <thead>
          <tr>
            <th scope="col">Заполнение, %</th>
            <th scope="col">С запасом, Н</th>
            <th scope="col">Расход, г</th>
            <th scope="col">Время, мин</th>
          </tr>
        </thead>
        <tbody>
          {result.response.experiments.map((row) => (
            <tr
              key={row.id}
              className={
                row.id === result.response.selectedExperimentId
                  ? styles['home-page__table-row--selected']
                  : ''
              }
            >
              <td>
                {number.format(row.infillPercent)}
                {row.id === result.response.selectedExperimentId && (
                  <span className={styles['home-page__silent']}> — выбранный вариант</span>
                )}
              </td>
              <td>
                {row.failureLoadN === null
                  ? 'Нет данных'
                  : number.format(row.failureLoadN / result.request.safetyFactor)}
              </td>
              <td>{number.format(row.materialConsumptionG)}</td>
              <td>{number.format(row.printTimeMin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
