import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { OptimizationRequest } from '../model/types';
import { readOptimizationRequest } from '../utils/read-optimization-request';

// Until the API is connected, submitting the form only selects the fixed mockup example.
export function useOptimization(onResult: () => void) {
  const [result, setResult] = useState<OptimizationRequest | null>(null);
  function submit(event: SyntheticEvent<HTMLFormElement>, fileName: string) {
    event.preventDefault();
    setResult(readOptimizationRequest(event.currentTarget, fileName));
    onResult();
  }
  function reset() {
    setResult(null);
  }
  return { result, submit, reset };
}
