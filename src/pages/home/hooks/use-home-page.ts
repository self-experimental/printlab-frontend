import { useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useModelUpload } from '@/features/model-viewer/hooks/use-model-upload';
import { useOptimization } from '@/features/optimization/hooks/use-optimization';
import { useUploadNotice } from './use-upload-notice';

export function useHomePage() {
  const [light, setLight] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const notice = useUploadNotice();
  const optimization = useOptimization(() => {
    notice.setMessage('Пример результата показан.');
  });
  function reset() {
    optimization.reset();
    notice.close();
  }
  const model = useModelUpload({
    onReset: reset,
    onSuccess: notice.setMessage,
    onError: notice.setError,
  });
  function toggleTheme() {
    setLight(!light);
  }
  function openUpload() {
    upload.current?.click();
  }
  function submit(event: SyntheticEvent<HTMLFormElement>) {
    optimization.submit(event, model.fileName);
  }
  return { light, upload, notice, model, optimization, toggleTheme, openUpload, submit, reset };
}
