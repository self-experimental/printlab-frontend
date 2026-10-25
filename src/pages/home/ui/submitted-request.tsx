import { Accordion } from '@mantine/core';
import type { OptimizationResult } from '@/features/optimization/model/types';
import styles from '../styles/home-page.module.css';
export function SubmittedRequest({ result }: { result: OptimizationResult }) {
  const r = result.request;
  return (
    <Accordion variant="contained" className={styles['home-page__submitted']}>
      <Accordion.Item value="request">
        <Accordion.Control>Параметры вашего запроса</Accordion.Control>
        <Accordion.Panel>
          <p>
            {result.fileName} · {r.material} · {r.requiredLoadN} Н · запас {r.safetyFactor} ·{' '}
            {r.testType}
          </p>
          <p>
            Слой: {r.layerHeightMm || 'подобрать'} · периметры: {r.perimeters || 'подобрать'} ·
            ориентация: {r.printOrientation || 'подобрать'}
          </p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
