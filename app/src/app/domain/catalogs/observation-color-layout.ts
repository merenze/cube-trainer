export type SideColorIndex = 0 | 1 | 2 | 3;

/** Maps each side-color index to the next index in the Red→Green→Orange→Blue cycle. */
export type SideColorSuccessor = { readonly 0: 1; readonly 1: 2; readonly 2: 3; readonly 3: 0 };

export type SideColorLayout = {
  left: [SideColorIndex, SideColorIndex, SideColorIndex];
  right: [SideColorIndex, SideColorIndex, SideColorIndex];
};

function toSideColorIndex(value: number): SideColorIndex {
  return value as SideColorIndex;
}

export function rotateSideColorIndex(
  color: SideColorIndex,
  offset: SideColorIndex,
): SideColorIndex {
  return toSideColorIndex((color + offset) % 4);
}

export function rotateColorLayout(
  layout: SideColorLayout,
  offset: SideColorIndex,
): SideColorLayout {
  return {
    left: [
      rotateSideColorIndex(layout.left[0], offset),
      rotateSideColorIndex(layout.left[1], offset),
      rotateSideColorIndex(layout.left[2], offset),
    ],
    right: [
      rotateSideColorIndex(layout.right[0], offset),
      rotateSideColorIndex(layout.right[1], offset),
      rotateSideColorIndex(layout.right[2], offset),
    ],
  };
}

export function normalizeObservedColorLayout(observed: SideColorLayout): {
  layout: SideColorLayout;
  anchorOffset: SideColorIndex;
} {
  const anchorOffset = observed.left[0];
  const inverseOffset = toSideColorIndex((4 - anchorOffset) % 4);

  return {
    layout: rotateColorLayout(observed, inverseOffset),
    anchorOffset,
  };
}
