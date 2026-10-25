import { Accordion, Alert, Badge, Loader, Paper, Table } from '@mantine/core';
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
            {response
              ? 'По расчёту Bambu Studio для вашей модели'
              : 'Выберите модель и запустите подбор параметров'}
          </p>
        </div>
      </div>
      {loading ? (
        <div className={styles['home-page__empty-results']} role="status">
          <Loader size="sm" style={{ flexShrink: 0 }} />
          <p>
            Готовим модель и сравниваем 6 вариантов печати. Для сложной модели это может занять до
            трёх минут…
          </p>
        </div>
      ) : error ? (
        <Alert color="red" className={styles['home-page__calculation-error']}>
          <p>{error}</p>
        </Alert>
      ) : response && selected ? (
        <>
          {response.candidates.length < response.plannedCandidateCount && (
            <Alert color="yellow" role="status" className={styles['home-page__partial-result']}>
              <strong>
                Сравнили {response.candidates.length} из {response.plannedCandidateCount} вариантов
              </strong>
              <p>Остальные не успели рассчитаться. Рекомендация выбрана среди готовых вариантов.</p>
            </Alert>
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
            <Table.ScrollContainer
              minWidth={620}
              type="native"
              tabIndex={0}
              role="region"
              aria-label="Таблица вариантов печати"
            >
              <Table highlightOnHover>
                <Table.Caption>Сравнение вариантов печати для загруженной модели</Table.Caption>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Заполнение, %</Table.Th>
                    <Table.Th scope="col">Периметры</Table.Th>
                    <Table.Th scope="col">Слой, мм</Table.Th>
                    <Table.Th scope="col">Время, мин</Table.Th>
                    <Table.Th scope="col">Расход, г</Table.Th>
                    <Table.Th scope="col">Результат</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {response.candidates.map((row) => (
                    <Table.Tr
                      key={row.id}
                      className={
                        row.id === selected.id ? styles['home-page__table-row--selected'] : ''
                      }
                    >
                      <Table.Td>{row.infillPercent}</Table.Td>
                      <Table.Td>{row.perimeters}</Table.Td>
                      <Table.Td>{number.format(row.layerHeightMm)}</Table.Td>
                      <Table.Td>{number.format(row.estimatedPrintTimeMin)}</Table.Td>
                      <Table.Td>{number.format(row.estimatedMaterialG)}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            row.id === selected.id
                              ? 'teal'
                              : row.meetsConstraints
                                ? 'gray'
                                : 'yellow'
                          }
                          variant="light"
                          tt="none"
                          size="md"
                        >
                          {row.id === selected.id
                            ? 'Рекомендуем'
                            : row.meetsConstraints
                              ? 'Подходит'
                              : 'За ограничениями'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
          <div className={styles['home-page__result-notes']}>
            <p>{response.explanation}</p>
            {response.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
            <Accordion variant="contained">
              <Accordion.Item value="calculation">
                <Accordion.Control>Как получен расчёт</Accordion.Control>
                <Accordion.Panel>
                  <p>
                    {response.printerName} · сопло {number.format(response.nozzleDiameterMm)} мм ·{' '}
                    {response.bedType}
                  </p>
                  <p>
                    {response.materialName} · Bambu Studio {response.engineVersion}
                  </p>
                  <p>{result.fileName}</p>
                  <p>
                    Поддержки:{' '}
                    {result.request.supportMode === 'AUTO' ? 'автоматические' : 'отключены'}
                  </p>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
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
    </Paper>
  );
}
