import { experiments } from '@/features/optimization/model/demo-data';
import styles from '../styles/home-page.module.css';

export function ExperimentTable() {
  return (
    <div className={styles['home-page__table-wrap']}>
      <h3>Экспериментальные данные</h3>
      <table>
        <caption>Пример данных из Figma</caption>
        <thead>
          <tr>
            <th scope="col">Заполнение, %</th>
            <th scope="col">Прочность, Н</th>
            <th scope="col">Расход, г</th>
            <th scope="col">Время, мин</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((row) => (
            <tr
              key={row[0]}
              className={row[0] === 40 ? styles['home-page__table-row--selected'] : ''}
            >
              {row.map((value, index) => (
                <td key={index}>{value.toLocaleString('ru-RU')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
