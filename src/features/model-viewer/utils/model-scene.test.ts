import { expect, it } from 'vitest';
import { createModelGeometry, createModelScene } from './model-scene';
import { EXAMPLE_MODEL } from '../stl';
import { INITIAL_VIEW } from '../model/view';
import { MockWebGLRenderer } from '@/test/webgl-renderer';
import type { BufferGeometry, Mesh, MeshStandardMaterial } from 'three';

it('сохраняет все треугольники и исходную форму большой модели', () => {
  const first = EXAMPLE_MODEL.triangles[0];
  if (!first) throw new Error('Missing example geometry');
  const triangles = Array.from(
    { length: 2000 },
    (_, i) => EXAMPLE_MODEL.triangles[i % 12] ?? first,
  );
  const geometry = createModelGeometry({ ...EXAMPLE_MODEL, triangles });
  const positions = geometry.getAttribute('position');
  expect(positions.count).toBe(6000);
  expect(geometry.getAttribute('normal').count).toBe(6000);
  expect([...positions.array].slice(-9)).toEqual(triangles.at(-1)?.flat());
  expect(geometry.boundingSphere?.radius).toBeGreaterThan(0);
  geometry.dispose();
});

it('создаёт непрозрачную поверхность, закрывающую внутренние грани, и освобождает память', async () => {
  const element = document.createElement('div');
  const scene = createModelScene(element, EXAMPLE_MODEL, () => undefined);
  scene.update({ ...INITIAL_VIEW, rotation: 1, tilt: Math.PI / 2, zoom: 1.5 });
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
  const renderer = MockWebGLRenderer.instances.at(-1);
  const mesh = renderer?.scene?.getObjectByName('uploaded-model') as Mesh<
    BufferGeometry,
    MeshStandardMaterial
  >;
  expect(mesh.material.transparent).toBe(false);
  expect(mesh.material.depthTest).toBe(true);
  expect(mesh.material.depthWrite).toBe(true);
  expect(mesh.material.wireframe).toBe(false);
  expect(mesh.geometry.getAttribute('position').count).toBe(EXAMPLE_MODEL.triangles.length * 3);
  scene.dispose();
  expect(element.querySelector('canvas')).toBeNull();
  expect(renderer?.disposed).toBe(true);
});
