import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { MAX_FILE_SIZE, parseStl } from '../stl';
import type { Model } from '../stl';
import { uploadErrors } from '@/shared/api/errors';

interface ModelUploadOptions {
  onReset: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}
export function useModelUpload({ onReset, onSuccess, onError }: ModelUploadOptions) {
  const [model, setModel] = useState<Model | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const sequence = useRef(0);
  const pending = useRef(false);
  useEffect(
    () => () => {
      sequence.current++;
    },
    [],
  );
  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected || pending.current) return;
    onReset();
    if (!/\.stl$/i.test(selected.name)) {
      onError(uploadErrors.WRONG_FILE_TYPE);
      return;
    }
    if (selected.size === 0) {
      onError(uploadErrors.EMPTY_FILE);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      onError(uploadErrors.FILE_TOO_LARGE);
      return;
    }
    const id = ++sequence.current;
    pending.current = true;
    setLoading(true);
    try {
      const bytes = await selected.arrayBuffer().catch((error: unknown) => {
        throw new Error('Не удалось прочитать файл. Выберите его заново.', { cause: error });
      });
      if (sequence.current !== id) return;
      const parsed = parseStl(bytes);
      setModel(parsed);
      setFile(selected);
      onSuccess('Модель открыта.');
    } catch (error) {
      if (sequence.current === id)
        onError(error instanceof Error ? error.message : 'Не удалось открыть модель.');
    } finally {
      if (sequence.current === id) {
        pending.current = false;
        setLoading(false);
      }
    }
  }
  function remove() {
    sequence.current++;
    pending.current = false;
    setLoading(false);
    setModel(null);
    setFile(null);
    onReset();
    onSuccess('Модель убрана из просмотра.');
  }
  return { model, file, fileName: file?.name ?? '', loading, readFile, remove };
}
