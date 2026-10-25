import { Accordion, Anchor } from '@mantine/core';
import type { MaterialProfile, MaterialProperty, MaterialRange } from '../model/types';
import styles from '../styles/material-details.module.css';

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const range = (r: MaterialRange) =>
  r.min === r.max ? number.format(r.min) : `${number.format(r.min)}–${number.format(r.max)}`;
const propertyLabels: Record<MaterialProperty, string> = {
  TENSILE_YIELD_STRENGTH: 'Предел текучести при растяжении',
  TENSILE_STRENGTH: 'Прочность при растяжении',
  TENSILE_MODULUS: 'Модуль упругости при растяжении',
  FLEXURAL_STRENGTH: 'Прочность при изгибе',
};
const directionLabels = {
  HORIZONTAL: 'Горизонтально',
  VERTICAL_XZ: 'Вертикально XZ',
  UNSPECIFIED: 'Не указано',
};

export function MaterialDetails({ material: m }: { material: MaterialProfile }) {
  return (
    <Accordion
      variant="contained"
      className={styles['material-details']}
      key={m.id}
      keepMounted
      keepMountedMode="display-none"
    >
      <Accordion.Item value="material">
        <Accordion.Control>Свойства материала и источник</Accordion.Control>
        <Accordion.Panel>
          <p>
            {m.name} · {m.manufacturer}
          </p>
          <dl className={styles['material-details__properties']}>
            <div>
              <dt>Сопло</dt>
              <dd>{range(m.printing.nozzleTemperatureC)} °C</dd>
            </div>
            <div>
              <dt>Стол</dt>
              <dd>{range(m.printing.bedTemperatureC)} °C</dd>
            </div>
            <div>
              <dt>Плотность</dt>
              <dd>{number.format(m.densityGcm3)} г/см³</dd>
            </div>
            <div>
              <dt>Скорость по паспорту</dt>
              <dd>до {number.format(m.printing.maxPrintSpeedMmS)} мм/с</dd>
            </div>
            <div>
              <dt>Обдув по паспорту</dt>
              <dd>{range(m.printing.coolingFanPercent)}%</dd>
            </div>
            {m.hdtAt045MpaC !== null && (
              <div>
                <dt>Температура прогиба (0,45 МПа)</dt>
                <dd>{number.format(m.hdtAt045MpaC)} °C</dd>
              </div>
            )}
            {m.hdtAt180MpaC !== null && (
              <div>
                <dt>Температура прогиба (1,8 МПа)</dt>
                <dd>{number.format(m.hdtAt180MpaC)} °C</dd>
              </div>
            )}
            {m.printing.hardenedNozzleRequired && (
              <div>
                <dt>Требование</dt>
                <dd>Закалённое сопло</dd>
              </div>
            )}
          </dl>
          <Accordion
            variant="contained"
            className={styles['material-details__tests']}
            keepMounted
            keepMountedMode="display-none"
          >
            <Accordion.Item value="tests">
              <Accordion.Control>Данные испытаний</Accordion.Control>
              <Accordion.Panel>
                {m.testSeries.map((series) => (
                  <div key={series.id}>
                    <h3>
                      {series.specimenType === 'PRINTED'
                        ? 'Испытания напечатанных образцов'
                        : 'Испытания литых образцов'}
                    </h3>
                    <p>{series.specimenDescription}</p>
                    <ul className={styles['material-details__measurements']}>
                      {series.measurements.map((measurement) => (
                        <li key={`${measurement.property}-${measurement.direction}`}>
                          <span>
                            {propertyLabels[measurement.property]} ·{' '}
                            {directionLabels[measurement.direction]}
                          </span>
                          <strong>
                            {number.format(measurement.value)}
                            {measurement.uncertainty !== null &&
                              ` ± ${number.format(measurement.uncertainty)}`}{' '}
                            МПа
                          </strong>
                          <small>{measurement.method}</small>
                        </li>
                      ))}
                    </ul>
                    {series.conditions && (
                      <>
                        <p>
                          Условия испытаний: слой {number.format(series.conditions.layerHeightMm)}{' '}
                          мм; периметры {series.conditions.perimeters}; заполнение{' '}
                          {series.conditions.infillPercent}% ({series.conditions.infillPattern});
                          сопло {series.conditions.nozzleTemperatureC} °C; стол{' '}
                          {series.conditions.bedTemperatureC} °C.
                        </p>
                        <p>
                          {series.conditions.printer} · {series.conditions.slicer}
                        </p>
                        {series.conditions.notes.map((note) => (
                          <p key={note}>{note}</p>
                        ))}
                      </>
                    )}
                  </div>
                ))}
                <p>Значения и разброс ± приведены по паспорту производителя.</p>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <p>
            Это справочные свойства материала. Нагрузка вашей детали зависит от её формы, креплений
            и направления силы и требует отдельного расчёта.
          </p>
          <Anchor href={m.source.url} target="_blank" rel="noreferrer">
            Паспорт производителя · версия {m.source.version} от {m.source.publishedOn}
          </Anchor>
          <small>
            Проверено {m.source.verifiedOn} · страницы {m.source.pages.join(', ')}
          </small>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
