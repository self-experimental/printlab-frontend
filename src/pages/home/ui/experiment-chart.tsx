import { experiments } from '@/features/optimization/model/demo-data';
import { chartX, chartY, experimentPolyline } from '@/features/optimization/utils/chart';
import styles from '../styles/home-page.module.css';

export function ExperimentChart() {
  return (
    <div className={styles['home-page__chart']}>
      <h3>Сравнение с экспериментальными данными</h3>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="Демонстрационная прочность: при заполнении от 10 до 70 процентов, от 48 до 268 Н. Данные приведены в таблице рядом."
      >
        {[0, 100, 200, 300].map((v) => (
          <g key={v}>
            <line x1="72" y1={chartY(v)} x2="580" y2={chartY(v)} />
            <text x="60" y={chartY(v) + 5} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <polyline points={experimentPolyline} />
        {experiments.map((row) => (
          <circle
            key={row[0]}
            cx={chartX(row[0])}
            cy={chartY(row[1])}
            r={row[0] === 40 ? 9 : 5}
            className={row[0] === 40 ? styles['home-page__chart-point--selected'] : ''}
          />
        ))}
        {[0, 50, 100].map((v) => (
          <text key={v} x={chartX(v)} y="236" textAnchor="middle">
            {v}
          </text>
        ))}
        <text x="326" y="258" textAnchor="middle">
          Заполнение, %
        </text>
        <text transform="translate(14 120) rotate(-90)" textAnchor="middle">
          Прочность, Н
        </text>
      </svg>
    </div>
  );
}
