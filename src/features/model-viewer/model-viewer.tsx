import type { Model } from './stl';
import { useModelViewer } from './hooks/use-model-viewer';
import { useModelScene } from './hooks/use-model-scene';
import { Icon } from '@/shared/ui/icon';
import styles from './styles/model-viewer.module.css';

export function ModelViewer({ model }: { model: Model }) {
  const { view, dragging, surface, rotate, zoomBy, reset, interaction } = useModelViewer();
  const { error, loading, retry } = useModelScene(surface, model, view);
  return (
    <div className={styles['model-viewer']}>
      <div
        ref={surface}
        className={styles['model-viewer__surface']}
        data-dragging={dragging}
        role="img"
        aria-busy={loading}
        aria-label="Предпросмотр геометрии STL-модели"
        aria-description="Перетаскивайте для вращения. Колесо или щипок меняет масштаб. С клавиатуры: стрелки, плюс, минус; Home сбрасывает вид."
        tabIndex={0}
        {...interaction}
      />
      {error && (
        <div className={styles['model-viewer__error']} role="alert">
          <p>
            Не удалось открыть 3D-просмотр. Попробуйте ещё раз или откройте страницу в другом
            браузере.
          </p>
          <button type="button" onClick={retry}>
            Попробовать ещё раз
          </button>
        </div>
      )}
      <div
        className={styles['model-viewer__controls']}
        role="group"
        aria-label="Управление моделью"
      >
        <div className={styles['model-viewer__group']} role="group" aria-label="Вращение модели">
          <button
            type="button"
            onClick={() => {
              rotate(-0.2, 0);
            }}
            aria-label="Повернуть влево"
            title="Повернуть влево"
          >
            <Icon name="left" />
          </button>
          <button
            type="button"
            onClick={() => {
              rotate(0.2, 0);
            }}
            aria-label="Повернуть вправо"
            title="Повернуть вправо"
          >
            <Icon name="right" />
          </button>
          <button
            type="button"
            onClick={() => {
              rotate(0, -0.2);
            }}
            aria-label="Наклонить вверх"
            title="Наклонить вверх"
          >
            <Icon name="up" />
          </button>
          <button
            type="button"
            onClick={() => {
              rotate(0, 0.2);
            }}
            aria-label="Наклонить вниз"
            title="Наклонить вниз"
          >
            <Icon name="down" />
          </button>
        </div>
        <div className={styles['model-viewer__group']} role="group" aria-label="Масштаб модели">
          <button
            type="button"
            onClick={() => {
              zoomBy(1 / 1.2);
            }}
            aria-label="Уменьшить модель"
            title="Уменьшить модель"
          >
            <Icon name="minus" />
          </button>
          <button
            type="button"
            onClick={() => {
              zoomBy(1.2);
            }}
            aria-label="Увеличить модель"
            title="Увеличить модель"
          >
            <Icon name="plus" />
          </button>
        </div>
        <button type="button" onClick={reset} aria-label="Сбросить вид" title="Сбросить вид">
          <Icon name="reset" />
        </button>
      </div>
    </div>
  );
}
