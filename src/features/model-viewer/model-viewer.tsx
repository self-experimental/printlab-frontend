import type { Model } from './stl';
import { useModelViewer } from './hooks/use-model-viewer';
import styles from './styles/model-viewer.module.css';

export function ModelViewer({ model }: { model: Model }) {
  const { faces, stride, wireframe, rotateLeft, rotateRight, zoomOut, zoomIn, toggleWireframe } =
    useModelViewer(model);
  return (
    <div className={styles['model-viewer']}>
      <svg viewBox="0 0 500 350" role="img" aria-label="Предпросмотр геометрии STL-модели">
        <defs>
          <pattern
            id="model-grid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
            patternTransform="matrix(1 .3 -1 .3 250 220)"
          >
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x="40"
          y="175"
          width="420"
          height="150"
          fill="url(#model-grid)"
          className={styles['model-viewer__grid']}
        />
        {faces.map((face, index) => (
          <polygon
            key={index}
            points={face.map((p) => `${String(p[0])},${String(p[1])}`).join(' ')}
            fill={wireframe ? 'none' : `hsl(176 43% ${String(37 + (index % 5) * 5)}%)`}
            stroke="var(--mesh-stroke, #164e4c)"
            strokeWidth={wireframe ? 0.8 : 0.5}
          />
        ))}
        <text x="452" y="314" className={styles['model-viewer__axis']}>
          X
        </text>
        <text x="80" y="314" className={styles['model-viewer__axis']}>
          Y
        </text>
        <text x="250" y="28" className={styles['model-viewer__axis']}>
          Z
        </text>
      </svg>
      <div className={styles['model-viewer__controls']} aria-label="Управление моделью">
        <button type="button" onClick={rotateLeft} aria-label="Повернуть влево">
          ↶
        </button>
        <button type="button" onClick={rotateRight} aria-label="Повернуть вправо">
          ↷
        </button>
        <span />
        <button type="button" onClick={zoomOut} aria-label="Уменьшить модель">
          −
        </button>
        <button type="button" onClick={zoomIn} aria-label="Увеличить модель">
          +
        </button>
        <button type="button" aria-pressed={wireframe} onClick={toggleWireframe}>
          Каркас
        </button>
      </div>
      {stride > 1 && (
        <p className={styles['model-viewer__hint']}>Облегчённый просмотр: показана часть граней.</p>
      )}
    </div>
  );
}
