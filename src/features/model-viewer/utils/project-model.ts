import type { Model, Point } from '../stl';

export function projectModel(model: Model, rotation: number, zoom: number) {
  function project([x, y, z]: Point): Point {
    const rx = x * Math.cos(rotation) - y * Math.sin(rotation);
    const ry = x * Math.sin(rotation) + y * Math.cos(rotation);
    return [250 + rx * 220 * zoom, 175 + (ry * 0.48 - z * 0.88) * 220 * zoom, ry + z * 0.5];
  }
  const stride = Math.ceil(model.triangles.length / 1500);
  const faces = model.triangles
    .filter((_, index) => index % stride === 0)
    .map((triangle) => triangle.map(project))
    .sort((a, b) => a.reduce((sum, p) => sum + p[2], 0) - b.reduce((sum, p) => sum + p[2], 0));

  return { faces, stride };
}
