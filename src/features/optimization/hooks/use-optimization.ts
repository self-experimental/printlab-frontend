import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { OptimizationResult } from '../model/types';
import { readOptimizationRequest } from '../utils/read-optimization-request';
import { optimizeModel } from '../api/optimization';

export function useOptimization() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const completed = useRef(false);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  async function submit(event: SyntheticEvent<HTMLFormElement>, file: File | null) {
    event.preventDefault();
    if (pending.current || completed.current) return;
    if (!file) {
      setError('Сначала выберите STL-модель.');
      return;
    }
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const abort = new AbortController();
    controller.current = abort;
    pending.current = true;
    setLoading(true);
    setError('');
    try {
      const request = readOptimizationRequest(form);
      const response = await optimizeModel(file, request, abort.signal);
      if (abort.signal.aborted) return;
      completed.current = true;
      setResult({ request, fileName: file.name, response });
    } catch (error) {
      if (!abort.signal.aborted)
        setError(
          error instanceof Error
            ? error.message
            : 'Не удалось выполнить расчёт. Попробуйте ещё раз.',
        );
    } finally {
      if (!abort.signal.aborted) {
        pending.current = false;
        setLoading(false);
      }
    }
  }
  function reset() {
    controller.current?.abort();
    pending.current = false;
    completed.current = false;
    setLoading(false);
    setResult(null);
    setError('');
  }
  return { result, error, loading, submit, reset };
}
