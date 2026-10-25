import { Table } from '@mantine/core';
import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export function ExperimentTable({ result }: { result: OptimizationResult }) {
  return (
    <div className={styles['home-page__table-wrap']}>
      <h3>Испытанные варианты</h3>
      <Table.ScrollContainer
        minWidth={460}
        type="native"
        tabIndex={0}
        role="region"
        aria-label="Таблица испытанных вариантов"
      >
        <Table highlightOnHover>
          <Table.Caption>Результаты испытаний сопоставленного образца</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Заполнение, %</Table.Th>
              <Table.Th scope="col">С запасом, Н</Table.Th>
              <Table.Th scope="col">Расход, г</Table.Th>
              <Table.Th scope="col">Время, мин</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {result.response.experiments.map((row) => (
              <Table.Tr
                key={row.id}
                className={
                  row.id === result.response.selectedExperimentId
                    ? styles['home-page__table-row--selected']
                    : ''
                }
              >
                <Table.Td>
                  {number.format(row.infillPercent)}
                  {row.id === result.response.selectedExperimentId && (
                    <span className={styles['home-page__silent']}> — выбранный вариант</span>
                  )}
                </Table.Td>
                <Table.Td>
                  {row.failureLoadN === null
                    ? 'Нет данных'
                    : number.format(row.failureLoadN / result.request.safetyFactor)}
                </Table.Td>
                <Table.Td>{number.format(row.materialConsumptionG)}</Table.Td>
                <Table.Td>{number.format(row.printTimeMin)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );
}
