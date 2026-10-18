import { ModelViewer } from '@/features/model-viewer/model-viewer';
import type { Model } from '@/features/model-viewer/stl';
import { formatModelInfo } from '@/features/model-viewer/utils/format-model-info';
import styles from '../styles/home-page.module.css';

interface ModelPanelProps {
  model: Model | null;
  fileName: string;
  loading: boolean;
  onRemove: () => void;
}
export function ModelPanel(props: ModelPanelProps) {
  const { model, fileName, loading, onRemove } = props;
  return (
    <section
      className={[styles['home-page__panel'], styles['home-page__model-panel']].join(' ')}
      aria-labelledby="model-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <span className={styles['home-page__step']}>01 / ГЕОМЕТРИЯ</span>
          <h2 id="model-heading">3D-модель</h2>
          <p>Просмотр загруженной STL-модели</p>
        </div>
        <span className={styles['home-page__file-badge']}>{model ? 'STL' : 'ПРИМЕР'}</span>
      </div>
      <div className={styles['home-page__viewport']} aria-busy={loading}>
        <details className={styles['home-page__model-info']}>
          <summary>Информация…</summary>
          <p>
            {model
              ? 'Размеры указаны в единицах STL; единицы измерения в формате не заданы.'
              : 'Выберите STL-файл через кнопку «Загрузить модель». Поддерживаются ASCII и бинарные STL до 15 МБ.'}
          </p>
        </details>
        {model ? (
          <ModelViewer key={fileName} model={model} />
        ) : (
          <div className={styles['home-page__model-placeholder']}>МОДЕЛЬ</div>
        )}
      </div>
      <div className={styles['home-page__model-footer']}>
        <div>
          <strong>{fileName || 'Модель ещё не загружена'}</strong>
          <small>{model ? formatModelInfo(model) : 'ASCII и бинарный STL · до 15 МБ'}</small>
        </div>
        {model && (
          <button type="button" className={styles['home-page__text-button']} onClick={onRemove}>
            Удалить
          </button>
        )}
      </div>
    </section>
  );
}
