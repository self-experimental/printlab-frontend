import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, parseStl } from './stl';

function ascii(body: string) {
  return new TextEncoder().encode(body).buffer;
}
const facet =
  'facet normal 0 0 1 outer loop vertex 0 0 0 vertex 2 0 0 vertex 0 2 0 endloop endfacet';
function binary(count = 1) {
  const buffer = new ArrayBuffer(84 + count * 50);
  const view = new DataView(buffer);
  view.setUint32(80, count, true);
  view.setFloat32(108, 2, true);
  view.setFloat32(124, 2, true);
  return buffer;
}
describe('STL', () => {
  it('читает ASCII и нормализует геометрию, сохраняя размеры', () => {
    const model = parseStl(ascii(`solid test ${facet} endsolid test`));
    expect(model.dimensions).toEqual([2, 2, 0]);
    expect(model.triangles).toEqual([
      [
        [-0.5, -0.5, 0],
        [0.5, -0.5, 0],
        [-0.5, 0.5, 0],
      ],
    ]);
  });
  it('читает бинарный STL, даже если заголовок начинается с solid', () => {
    const buffer = binary();
    new Uint8Array(buffer).set(new TextEncoder().encode('solid binary'));
    expect(parseStl(buffer).dimensions).toEqual([2, 2, 0]);
  });
  it('отклоняет повреждённые, пустые и вырожденные файлы', () => {
    for (const content of [
      '',
      'not stl',
      'solid x endsolid',
      'solid x facet normal 0 0 0 vertex 1 1 1 endfacet endsolid',
      `solid x ${facet.replaceAll('2', '0')} endsolid`,
    ]) {
      expect(() => parseStl(ascii(content))).toThrow();
    }
  });
  it('отклоняет нечисловые, бесконечные и чрезмерные координаты', () => {
    for (const value of ['NaN', 'Infinity', '1e13']) {
      expect(() =>
        parseStl(ascii(`solid x ${facet.replace('vertex 2', `vertex ${value}`)} endsolid`)),
      ).toThrow('координаты');
    }
    const buffer = binary();
    new DataView(buffer).setFloat32(96, NaN, true);
    expect(() => parseStl(buffer)).toThrow('координаты');
  });
  it('ограничивает размер и число граней', () => {
    expect(() => parseStl(new ArrayBuffer(MAX_FILE_SIZE + 1))).toThrow('15 МБ');
    expect(() => parseStl(binary(100001))).toThrow('100 000');
    expect(() =>
      parseStl(ascii(`solid x ${'facet normal endfacet '.repeat(100001)} endsolid`)),
    ).toThrow('100 000');
  });
});
