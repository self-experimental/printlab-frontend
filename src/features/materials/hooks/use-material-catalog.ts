import { useEffect, useState } from 'react';
import { fetchMaterialCatalog } from '../api/materials';
import type { MaterialCatalog } from '../model/types';

export function useMaterialCatalog() {
  const [catalog, setCatalog] = useState<MaterialCatalog | null>(null);
  const [selectedId, select] = useState('prusament-pla');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void fetchMaterialCatalog().then(
      (value) => {
        if (active) setCatalog(value);
      },
      (reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : 'Не удалось загрузить список материалов.',
          );
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);
  function retry() {
    setError('');
    setAttempt((value) => value + 1);
  }
  const selected = catalog?.materials.find((m) => m.id === selectedId) ?? catalog?.materials[0];
  return { catalog, selected, select, error, retry };
}
