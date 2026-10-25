import type { OptimizationResult } from '@/features/optimization/model/types';
import { buildExperimentChart } from '@/features/optimization/utils/chart';
import styles from '../styles/home-page.module.css';
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
export function ExperimentChart({ result }: { result: OptimizationResult }) {
  const { samples, max, x, y } = buildExperimentChart(result);
  return (
    <div className={styles['home-page__chart']}>
      <h3>Нагрузка по испытаниям</h3>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="Нагрузка с учётом запаса для испытанных вариантов; значения приведены в таблице рядом"
      >
        {[0, max / 2, max].map((value) => (
          <g key={value}>
            <line x1="72" y1={y(value)} x2="580" y2={y(value)} />
            <text x="60" y={y(value) + 5} textAnchor="end">
              {number.format(value)}
            </text>
          </g>
        ))}
        <line
          className={styles['home-page__required-load']}
          x1="72"
          y1={y(result.request.requiredLoadN)}
          x2="580"
          y2={y(result.request.requiredLoadN)}
          strokeDasharray="6 4"
        />
        <text x="580" y={y(result.request.requiredLoadN) - 9} textAnchor="end">
          Нужно {number.format(result.request.requiredLoadN)} Н
        </text>
        {samples.map((row) => (
          <circle
            key={row.id}
            cx={x(row.fill)}
            cy={y(row.capacity)}
            r={row.id === result.response.selectedExperimentId ? 8 : 5}
            className={
              row.id === result.response.selectedExperimentId
                ? styles['home-page__chart-point--selected']
                : ''
            }
          />
        ))}
        {[0, 50, 100].map((value) => (
          <text key={value} x={x(value)} y="236" textAnchor="middle">
            {value}
          </text>
        ))}
        <text x="326" y="258" textAnchor="middle">
          Заполнение, %
        </text>
        <text transform="translate(14 120) rotate(-90)" textAnchor="middle">
          Нагрузка с запасом, Н
        </text>
      </svg>
    </div>
  );
}
