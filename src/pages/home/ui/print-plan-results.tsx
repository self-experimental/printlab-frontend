import type { PrintPlanResult } from '@/features/print-plan/model/types';
import styles from '../styles/home-page.module.css';
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export function PrintPlanResults({
  result,
  loading,
  error,
}: {
  result: PrintPlanResult | null;
  loading: boolean;
  error: string;
}) {
  const response = result?.response;
  const selected = response?.candidates.find((c) => c.id === response.selectedCandidateId);
  return (
    <section
      className={[styles['home-page__panel'], styles['home-page__results']].join(' ')}
      aria-labelledby="results-heading"
      aria-busy={loading}
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <h2 id="results-heading">Результаты подбора</h2>
          <p>
            {response
              ? 'По расчёту Bambu Studio для вашей модели'
              : 'Выберите модель и запустите подбор параметров'}
          </p>
        </div>
      </div>
      {loading ? (
        <div className={styles['home-page__empty-results']} role="status">
          <p>
            Готовим модель и сравниваем 6 вариантов печати. Для сложной модели это может занять до
            трёх минут…
          </p>
        </div>
      ) : error ? (
        <div className={styles['home-page__calculation-error']} role="alert">
          <strong>Не удалось подобрать параметры</strong>
          <p>{error}</p>
        </div>
      ) : response && selected ? (
        <>
          {response.candidates.length < response.plannedCandidateCount && (
            <div className={styles['home-page__partial-result']} role="status">
              <strong>
                Сравнили {response.candidates.length} из {response.plannedCandidateCount} вариантов
              </strong>
              <p>Остальные не успели рассчитаться. Рекомендация выбрана среди готовых вариантов.</p>
            </div>
          )}
          <div className={styles['home-page__print-summary']}>
            <div>
              <span>Оценка времени</span>
              <strong>{number.format(selected.estimatedPrintTimeMin)} мин</strong>
            </div>
            <div>
              <span>Расход материала</span>
              <strong>{number.format(selected.estimatedMaterialG)} г</strong>
            </div>
            <div>
              <span>Заполнение</span>
              <strong>{selected.infillPercent}%</strong>
            </div>
            <div>
              <span>Периметры</span>
              <strong>{selected.perimeters}</strong>
            </div>
            <div>
              <span>Высота слоя</span>
              <strong>{number.format(selected.layerHeightMm)} мм</strong>
            </div>
            <div>
              <span>Тип заполнения</span>
              <strong>{selected.infillPattern === 'GYROID' ? 'Гироид' : 'Прямолинейное'}</strong>
            </div>
          </div>
          <div
            className={[styles['home-page__table-wrap'], styles['home-page__print-table']].join(
              ' ',
            )}
          >
            <h3>Рассчитанные варианты</h3>
            <table>
              <caption>Сравнение вариантов печати для загруженной модели</caption>
              <thead>
                <tr>
                  <th scope="col">Заполнение, %</th>
                  <th scope="col">Периметры</th>
                  <th scope="col">Слой, мм</th>
                  <th scope="col">Время, мин</th>
                  <th scope="col">Расход, г</th>
                  <th scope="col">Результат</th>
                </tr>
              </thead>
              <tbody>
                {response.candidates.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.id === selected.id ? styles['home-page__table-row--selected'] : ''
                    }
                  >
                    <td>{row.infillPercent}</td>
                    <td>{row.perimeters}</td>
                    <td>{number.format(row.layerHeightMm)}</td>
                    <td>{number.format(row.estimatedPrintTimeMin)}</td>
                    <td>{number.format(row.estimatedMaterialG)}</td>
                    <td>
                      {row.id === selected.id
                        ? 'Рекомендуем'
                        : row.meetsConstraints
                          ? 'Подходит'
                          : 'За ограничениями'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles['home-page__result-notes']}>
            <p>{response.explanation}</p>
            {response.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
            <details>
              <summary>Как получен расчёт</summary>
              <p>
                {response.printerName} · сопло {number.format(response.nozzleDiameterMm)} мм ·{' '}
                {response.bedType}
              </p>
              <p>
                {response.materialName} · Bambu Studio {response.engineVersion}
              </p>
              <p>{result.fileName}</p>
              <p>
                Поддержки: {result.request.supportMode === 'AUTO' ? 'автоматические' : 'отключены'}
              </p>
            </details>
          </div>
        </>
      ) : (
        <div className={styles['home-page__empty-results']}>
          <span aria-hidden="true">↗</span>
          <div>
            <strong>Здесь появится результат</strong>
            <p>Время печати, расход материала и сравнение настроек для вашего STL</p>
          </div>
        </div>
      )}
    </section>
  );
}
