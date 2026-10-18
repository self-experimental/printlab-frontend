export type Point = [number, number, number];
export type Triangle = [Point, Point, Point];
export interface Model {
  triangles: Triangle[];
  dimensions: Point;
}

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_TRIANGLES = 100_000;

export function parseStl(buffer: ArrayBuffer): Model {
  if (buffer.byteLength > MAX_FILE_SIZE) throw new Error('Файл больше 15 МБ.');
  const triangles: Triangle[] = [];
  const view = new DataView(buffer);
  const count = buffer.byteLength >= 84 ? view.getUint32(80, true) : 0;
  if (count > 0 && 84 + count * 50 === buffer.byteLength) {
    if (count > MAX_TRIANGLES) throw new Error('В модели больше 100 000 треугольников.');
    for (let i = 0; i < count; i++) {
      const points: Point[] = [];
      for (let j = 0; j < 3; j++) {
        const offset = 84 + i * 50 + 12 + j * 12;
        points.push([
          view.getFloat32(offset, true),
          view.getFloat32(offset + 4, true),
          view.getFloat32(offset + 8, true),
        ]);
      }
      triangles.push(points as Triangle);
    }
  } else {
    const source = new TextDecoder().decode(buffer).trim();
    if (!/^solid\b/i.test(source) || !/endsolid\b/i.test(source)) {
      throw new Error('Не удалось прочитать STL. Выберите корректный ASCII или бинарный STL.');
    }
    const facets = [...source.matchAll(/facet\s+normal\b[\s\S]*?endfacet/gi)];
    if (facets.length > MAX_TRIANGLES) throw new Error('В модели больше 100 000 треугольников.');
    for (const facet of facets) {
      const vertices = [...facet[0].matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/gi)];
      if (vertices.length !== 3) throw new Error('Повреждён STL: у грани должно быть три вершины.');
      triangles.push(vertices.map((v) => [Number(v[1]), Number(v[2]), Number(v[3])]) as Triangle);
    }
  }
  if (!triangles.length) throw new Error('В STL нет треугольников.');
  const min: Point = [Infinity, Infinity, Infinity];
  const max: Point = [-Infinity, -Infinity, -Infinity];
  for (const triangle of triangles) {
    for (const point of triangle) {
      for (const axis of [0, 1, 2] as const) {
        const value = point[axis];
        if (!Number.isFinite(value) || Math.abs(value) > 1e12) {
          throw new Error('STL содержит недопустимые координаты.');
        }
        min[axis] = Math.min(min[axis], value);
        max[axis] = Math.max(max[axis], value);
      }
    }
  }
  const dimensions = ([0, 1, 2] as const).map((axis) => max[axis] - min[axis]) as Point;
  const size = Math.max(...dimensions);
  if (size === 0) throw new Error('У модели нулевой размер.');
  return {
    dimensions,
    triangles: triangles.map(
      (triangle) =>
        triangle.map((point) =>
          ([0, 1, 2] as const).map((axis) => (point[axis] - (min[axis] + max[axis]) / 2) / size),
        ) as Triangle,
    ),
  };
}

const corners: Point[] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
];
export const EXAMPLE_MODEL: Model = {
  dimensions: [1, 1, 1],
  triangles: [
    [0, 1, 2],
    [0, 2, 3],
    [4, 6, 5],
    [4, 7, 6],
    [0, 4, 5],
    [0, 5, 1],
    [3, 2, 6],
    [3, 6, 7],
    [0, 3, 7],
    [0, 7, 4],
    [1, 5, 6],
    [1, 6, 2],
  ].map((face) => face.map((index) => corners[index] ?? [0, 0, 0]) as Triangle),
};
