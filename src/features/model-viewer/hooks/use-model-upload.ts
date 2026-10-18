import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { MAX_FILE_SIZE, parseStl } from '../stl';
import type { Model } from '../stl';

interface ModelUploadOptions {
  onReset: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}
export function useModelUpload({ onReset, onSuccess, onError }: ModelUploadOptions) {
  const [model, setModel] = useState<Model | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const id = ++requestId.current;
    event.target.value = '';
    setLoading(false);
    onReset();
    setModel(null);
    setFileName('');
    if (!/\.stl$/i.test(file.name)) {
      onError('Выберите файл с расширением .stl.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onError('Файл больше 15 МБ. Выберите модель меньшего размера.');
      return;
    }
    setLoading(true);
    try {
      const parsed = parseStl(await file.arrayBuffer());
      if (requestId.current !== id) return;
      setModel(parsed);
      setFileName(file.name);
      onSuccess('Модель успешно загружена.');
    } catch {
      if (requestId.current === id)
        onError(
          'Не удалось загрузить модель. Проверьте STL: до 15 МБ, до 100 000 граней, корректные координаты.',
        );
    } finally {
      if (requestId.current === id) {
        setLoading(false);
        event.target.value = '';
      }
    }
  }
  function remove() {
    setModel(null);
    setFileName('');
    onReset();
    onSuccess('Модель удалена.');
  }
  return { model, fileName, loading, readFile, remove };
}
