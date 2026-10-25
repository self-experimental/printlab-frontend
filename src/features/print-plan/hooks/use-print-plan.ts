import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { PrintPlanResult } from '../model/types';
import { readPrintPlanRequest } from '../utils/read-print-plan-request';
import { calculatePrintPlan } from '../api/print-plans';

export function usePrintPlan() {
  const [result, setResult] = useState<PrintPlanResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const locked = useRef(false);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  async function submit(event: SyntheticEvent<HTMLFormElement>, file: File | null) {
    event.preventDefault();
    if (locked.current) return;
    if (!file) {
      setError('Сначала выберите STL-модель.');
      return;
    }
    if (!event.currentTarget.reportValidity()) return;
    const abort = new AbortController();
    controller.current = abort;
    locked.current = true;
    setLoading(true);
    setError('');
    try {
      const request = readPrintPlanRequest(event.currentTarget);
      const response = await calculatePrintPlan(file, request, abort.signal);
      if (!abort.signal.aborted) setResult({ fileName: file.name, request, response });
    } catch (reason) {
      if (!abort.signal.aborted) {
        locked.current = false;
        setError(
          reason instanceof Error
            ? reason.message
            : 'Не удалось рассчитать печать. Попробуйте ещё раз.',
        );
      }
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  }
  function reset() {
    controller.current?.abort();
    locked.current = false;
    setLoading(false);
    setResult(null);
    setError('');
  }
  return { result, error, loading, submit, reset };
}
