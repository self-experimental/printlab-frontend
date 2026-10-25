import { ModelViewer } from '@/features/model-viewer/model-viewer';
import { Badge, Button, Loader, Paper } from '@mantine/core';
import type { Model } from '@/features/model-viewer/stl';
import { formatFileSize, formatModelInfo } from '@/features/model-viewer/utils/format-model-info';
import { Icon } from '@/shared/ui/icon';
import styles from '../styles/home-page.module.css';

interface ModelPanelProps {
  model: Model | null;
  file: File | null;
  fileName: string;
  loading: boolean;
  onRemove: () => void;
}
export function ModelPanel(props: ModelPanelProps) {
  const { model, file, fileName, loading, onRemove } = props;
  return (
    <Paper
      component="section"
      withBorder
      className={[styles['home-page__panel'], styles['home-page__model-panel']].join(' ')}
      aria-labelledby="model-heading"
    >
      <div className={styles['home-page__panel-header']}>
        <div>
          <span className={styles['home-page__step']}>01 / ГЕОМЕТРИЯ</span>
          <h2 id="model-heading">3D-модель</h2>
          <p>Просмотр загруженной STL-модели</p>
        </div>
        <Badge variant="light" color={model ? 'teal' : 'gray'}>
          {model ? 'STL' : 'Нет файла'}
        </Badge>
      </div>
      <div className={styles['home-page__viewport']} aria-busy={loading}>
        {model ? (
          <ModelViewer key={fileName} model={model} />
        ) : (
          <div className={styles['home-page__model-placeholder']} aria-hidden="true">
            {loading && <Loader size="sm" />}
          </div>
        )}
      </div>
      <div className={styles['home-page__model-footer']}>
        <div>
          <strong>{fileName || 'Модель ещё не загружена'}</strong>
          <small>{model ? formatModelInfo(model) : 'ASCII и бинарный STL · до 15 МБ'}</small>
          {file && (
            <div className={styles['home-page__saved-model']}>
              <span>Модель открыта</span>
              <dl>
                <div>
                  <dt>Размер файла</dt>
                  <dd>{formatFileSize(file.size)}</dd>
                </div>
              </dl>
            </div>
          )}
          <p aria-live="polite">{loading ? 'Открываем модель…' : ''}</p>
        </div>
        {file && (
          <Button
            color="red"
            variant="filled"
            leftSection={<Icon name="close" />}
            type="button"
            className={styles['home-page__remove-button']}
            onClick={onRemove}
            disabled={loading}
          >
            <span>Убрать из просмотра</span>
          </Button>
        )}
      </div>
    </Paper>
  );
}
