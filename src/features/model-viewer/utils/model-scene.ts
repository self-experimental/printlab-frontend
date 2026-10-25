import {
  ACESFilmicToneMapping,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Model } from '../stl';
import { INITIAL_VIEW } from '../model/view';
import type { ModelView } from '../model/view';

/** Keeps every triangle. Normals smooth curves without rounding sharp CAD edges. */
export function createModelGeometry(model: Model): BufferGeometry {
  const vertices = new Float32Array(model.triangles.length * 9);
  let offset = 0;
  for (const triangle of model.triangles) {
    for (const point of triangle) {
      vertices.set(point, offset);
      offset += 3;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  toCreasedNormals(geometry, Math.PI / 4);
  geometry.computeBoundingSphere();
  return geometry;
}

export interface ModelScene {
  update: (view: ModelView) => void;
  dispose: () => void;
}

export function createModelScene(
  element: HTMLElement,
  model: Model,
  onContextLost: () => void,
  onReady?: () => void,
): ModelScene {
  // Create the context before allocating geometry, so unsupported browsers leak nothing.
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  const geometry = createModelGeometry(model);
  const material = new MeshStandardMaterial({
    color: '#54bbb6',
    roughness: 0.65,
    metalness: 0.05,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = 'uploaded-model';
  const scene = new Scene();
  scene.add(mesh, new HemisphereLight('#ffffff', '#6b7785', 2.1));
  const key = new DirectionalLight('#ffffff', 2.8);
  key.position.set(-3, -4, 6);
  const fill = new DirectionalLight('#d3e7ff', 1);
  fill.position.set(4, 2, 3);
  scene.add(key, fill);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
  camera.up.set(0, 0, 1);
  let view = INITIAL_VIEW;
  let frame: number | null = null;
  let disposed = false;
  let rendered = false;
  const radius = Math.max(geometry.boundingSphere?.radius ?? 0.5, 0.01);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  element.append(canvas);

  function invalidate() {
    if (disposed || frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (!disposed) {
        renderer.render(scene, camera);
        if (!rendered) {
          rendered = true;
          onReady?.();
        }
      }
    });
  }
  function update(next: ModelView) {
    view = next;
    const elevation = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, view.tilt));
    camera.position.set(
      3 * Math.sin(view.rotation) * Math.cos(elevation),
      -3 * Math.cos(view.rotation) * Math.cos(elevation),
      3 * Math.sin(elevation),
    );
    camera.lookAt(0, 0, 0);
    camera.zoom = view.zoom;
    camera.updateProjectionMatrix();
    invalidate();
  }
  function resize() {
    const width = Math.max(element.clientWidth, 1);
    const height = Math.max(element.clientHeight, 1);
    const aspect = width / height;
    const halfHeight = radius * 1.2 * Math.max(1, 1 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    renderer.setSize(width, height, false);
    update(view);
  }
  function contextLost(event: Event) {
    event.preventDefault();
    onContextLost();
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  const observer = new ResizeObserver(resize);
  observer.observe(element);
  resize();

  return {
    update,
    dispose() {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
