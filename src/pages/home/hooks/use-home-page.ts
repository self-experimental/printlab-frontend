import { useRef, useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import type { SyntheticEvent } from 'react';
import { useModelUpload } from '@/features/model-viewer/hooks/use-model-upload';
import { useOptimization } from '@/features/optimization/hooks/use-optimization';
import { usePrintPlan } from '@/features/print-plan/hooks/use-print-plan';
import { useUploadNotice } from './use-upload-notice';

export function useHomePage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const light = colorScheme === 'light';
  const upload = useRef<HTMLInputElement>(null);
  const notice = useUploadNotice();
  const optimization = useOptimization();
  const printPlan = usePrintPlan();
  const [mode, setMode] = useState<'PRINT' | 'LOAD'>('PRINT');
  function reset() {
    optimization.reset();
    printPlan.reset();
    notice.close();
  }
  const model = useModelUpload({
    onReset: reset,
    onSuccess: notice.setMessage,
    onError: notice.setError,
  });
  function toggleTheme() {
    toggleColorScheme();
  }
  function openUpload() {
    upload.current?.click();
  }
  function submit(event: SyntheticEvent<HTMLFormElement>) {
    if (mode === 'PRINT') void printPlan.submit(event, model.file);
    else void optimization.submit(event, model.file);
  }
  function changeMode(value: 'PRINT' | 'LOAD') {
    reset();
    setMode(value);
  }
  return {
    light,
    upload,
    notice,
    model,
    optimization,
    printPlan,
    mode,
    changeMode,
    toggleTheme,
    openUpload,
    submit,
    reset,
  };
}
