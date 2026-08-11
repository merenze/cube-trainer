import {
  normalizeObservedColorLayout,
  rotateColorLayout,
  rotateSideColorIndex,
  type SideColorLayout,
} from './observation-color-layout';

describe('observation color layout', () => {
  it('should rotate a side color index modulo 4', () => {
    expect(rotateSideColorIndex(0, 0)).toBe(0);
    expect(rotateSideColorIndex(3, 1)).toBe(0);
    expect(rotateSideColorIndex(2, 3)).toBe(1);
  });

  it('should rotate every sticker index in a layout', () => {
    const layout: SideColorLayout = {
      left: [0, 2, 0],
      right: [1, 0, 1],
    };

    expect(rotateColorLayout(layout, 1)).toEqual({
      left: [1, 3, 1],
      right: [2, 1, 2],
    });
    expect(rotateColorLayout(layout, 2)).toEqual({
      left: [2, 0, 2],
      right: [3, 2, 3],
    });
  });

  it('should normalize an observed layout so Left_0 becomes zero', () => {
    const canonical: SideColorLayout = {
      left: [0, 3, 1],
      right: [2, 0, 0],
    };
    const observed = rotateColorLayout(canonical, 2);

    expect(observed.left[0]).toBe(2);

    const normalized = normalizeObservedColorLayout(observed);

    expect(normalized.layout).toEqual(canonical);
    expect(normalized.anchorOffset).toBe(2);
  });
});
