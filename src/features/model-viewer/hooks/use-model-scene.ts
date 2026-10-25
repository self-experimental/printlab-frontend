import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Model } from '../stl';
import type { ModelView } from '../model/view';
import type { ModelScene } from '../utils/model-scene';

export function useModelScene(
  surface: RefObject<HTMLDivElement | null>,
  model: Model,
  view: ModelView,
) {
  const scene = useRef<ModelScene | null>(null);
  const currentView = useRef(view);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    currentView.current = view;
    scene.current?.update(view);
  }, [view]);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    let cancelled = false;
    let created: ModelScene | null = null;
    async function setup(target: HTMLDivElement) {
      setReady(false);
      try {
        const { createModelScene } = await import('../utils/model-scene');
        if (cancelled) return;
        created = createModelScene(
          target,
          model,
          () => {
            if (!cancelled) setError(true);
          },
          () => {
            if (!cancelled) setReady(true);
          },
        );
        scene.current = created;
        created.update(currentView.current);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    void setup(element);
    return () => {
      cancelled = true;
      created?.dispose();
      scene.current = null;
    };
  }, [surface, model, attempt]);

  return {
    error,
    loading: !ready && !error,
    retry: () => {
      setAttempt((value) => value + 1);
    },
  };
}
