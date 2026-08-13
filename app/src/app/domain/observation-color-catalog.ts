import { type FacePattern, type PllPermutation } from './pll-catalog';
import {
  normalizeObservedColorLayout,
  type SideColorIndex,
  type SideColorLayout,
  type SideColorSuccessor,
} from './observation-color-layout';

export type { SideColorLayout };

export type ObservationTripletKey =
  `${PllPermutation}|${FacePattern}|${FacePattern}`;

export type ObservationColorMapping = {
  permutation: PllPermutation;
  leftPattern: FacePattern;
  rightPattern: FacePattern;
  layout: SideColorLayout;
};

// Left_2 is the inner sticker of the left face (adjacent to the right face).
// Right_0 is the inner sticker of the right face (adjacent to the left face).
// At their shared FRU corner, the two face colors must be adjacent in the cycle, and
// since the right visible face is always clockwise of the left, Right_0 = successor(Left_2).
function createObservationColorMapping<L2 extends SideColorIndex>(
  permutation: PllPermutation,
  leftPattern: FacePattern,
  rightPattern: FacePattern,
  left: [SideColorIndex, SideColorIndex, L2],
  right: [SideColorSuccessor[L2], SideColorIndex, SideColorIndex],
): ObservationColorMapping {
  return {
    permutation,
    leftPattern,
    rightPattern,
    layout: {
      left,
      right,
    },
  };
}

export function createObservationTripletKey(
  permutation: PllPermutation,
  leftPattern: FacePattern,
  rightPattern: FacePattern,
): ObservationTripletKey {
  return `${permutation}|${leftPattern}|${rightPattern}`;
}

export const CANONICAL_OBSERVATION_COLOR_MAPPINGS = [
  createObservationColorMapping('Ub', 'Headlights', 'Headlights', [0, 2, 0], [1, 0, 1]),
  createObservationColorMapping('Ub', 'Headlights', '3-bar', [0, 3, 0], [1, 1, 1]),
  createObservationColorMapping('Ub', '3-bar', 'Headlights', [0, 0, 0], [1, 3, 1]),
  createObservationColorMapping('Ua', 'Headlights', 'Headlights', [0, 1, 0], [1, 2, 1]),
  createObservationColorMapping('Ua', 'Headlights', '3-bar', [0, 2, 0], [1, 1, 1]),
  createObservationColorMapping('Ua', '3-bar', 'Headlights', [0, 0, 0], [1, 2, 1]),
  createObservationColorMapping('Z', 'Headlights', 'Headlights', [0, 3, 0], [1, 2, 1]),
  createObservationColorMapping('Z', 'Headlights', 'Headlights', [0, 1, 0], [1, 0, 1]),
  createObservationColorMapping('H', 'Headlights', 'Headlights', [0, 2, 0], [1, 3, 1]),
  createObservationColorMapping('Aa', '2-bar inside', '2-bar inside', [0, 1, 1], [2, 2, 0]),
  createObservationColorMapping('Aa', '2-bar outside', 'None', [0, 0, 2], [3, 1, 0]),
  createObservationColorMapping('Aa', 'None', 'Headlights', [0, 2, 1], [2, 3, 2]),
  createObservationColorMapping('Aa', 'Headlights', '2-bar outside', [0, 1, 0], [1, 2, 2]),
  createObservationColorMapping('Ab', '2-bar inside', '2-bar inside', [0, 2, 2], [3, 3, 0]),
  createObservationColorMapping('Ab', '2-bar outside', 'Headlights', [0, 0, 1], [2, 1, 2]),
  createObservationColorMapping('Ab', 'Headlights', 'None', [0, 3, 0], [1, 0, 2]),
  createObservationColorMapping('Ab', 'None', '2-bar outside', [0, 3, 1], [2, 0, 0]),
  createObservationColorMapping('E', 'None', 'None', [0, 3, 2], [3, 0, 1]),
  createObservationColorMapping('E', 'None', 'None', [0, 1, 2], [3, 2, 1]),
  createObservationColorMapping('Ra', 'Headlights', '2-bar inside', [0, 3, 0], [1, 1, 2]),
  createObservationColorMapping('Ra', '2-bar outside', 'None', [0, 0, 1], [2, 1, 0]),
  createObservationColorMapping('Ra', 'None', 'None', [0, 3, 2], [3, 1, 0]),
  createObservationColorMapping('Ra', 'None', 'Headlights', [0, 2, 1], [2, 1, 2]),
  createObservationColorMapping('Rb', '2-bar inside', 'Headlights', [0, 1, 1], [2, 3, 2]),
  createObservationColorMapping('Rb', 'Headlights', 'None', [0, 1, 0], [1, 0, 2]),
  createObservationColorMapping('Rb', 'None', 'None', [0, 3, 1], [2, 1, 0]),
  createObservationColorMapping('Rb', 'None', '2-bar outside', [0, 3, 2], [3, 0, 0]),
  createObservationColorMapping('Ja', '2-bar outside', '3-bar', [0, 0, 1], [2, 2, 2]),
  createObservationColorMapping('Ja', '3-bar', '2-bar inside', [0, 0, 0], [1, 1, 2]),
  createObservationColorMapping('Ja', '2-bar outside', '2-bar inside', [0, 0, 1], [2, 2, 0]),
  createObservationColorMapping('Ja', '2-bar outside', '2-bar inside', [0, 0, 2], [3, 3, 0]),
  createObservationColorMapping('Jb', '3-bar', '2-bar outside', [0, 0, 0], [1, 2, 2]),
  createObservationColorMapping('Jb', '2-bar inside', '2-bar outside', [0, 1, 1], [2, 0, 0]),
  createObservationColorMapping('Jb', '2-bar inside', '2-bar outside', [0, 2, 2], [3, 0, 0]),
  createObservationColorMapping('Jb', '2-bar inside', '3-bar', [0, 1, 1], [2, 2, 2]),
  createObservationColorMapping('T', 'Headlights', '2-bar inside', [0, 2, 0], [1, 1, 2]),
  createObservationColorMapping('T', '2-bar outside', 'None', [0, 0, 1], [2, 3, 0]),
  createObservationColorMapping('T', 'None', '2-bar outside', [0, 1, 2], [3, 0, 0]),
  createObservationColorMapping('T', '2-bar inside', 'Headlights', [0, 1, 1], [2, 0, 2]),
  createObservationColorMapping('F', '3-bar', 'None', [0, 0, 0], [1, 3, 2]),
  createObservationColorMapping('F', 'None', 'None', [0, 2, 1], [2, 1, 0]),
  createObservationColorMapping('F', 'None', '3-bar', [0, 3, 1], [2, 2, 2]),
  createObservationColorMapping('V', '2-bar inside', '2-bar inside', [0, 2, 2], [3, 3, 1]),
  createObservationColorMapping('V', '2-bar outside', 'None', [0, 0, 2], [3, 2, 1]),
  createObservationColorMapping('V', 'None', 'None', [0, 3, 2], [3, 2, 1]),
  createObservationColorMapping('V', 'None', '2-bar outside', [0, 3, 2], [3, 1, 1]),
  createObservationColorMapping('Y', 'None', '2-bar inside', [0, 1, 2], [3, 3, 1]),
  createObservationColorMapping('Y', '2-bar outside', '2-bar outside', [0, 0, 2], [3, 1, 1]),
  createObservationColorMapping('Y', '2-bar inside', 'None', [0, 2, 2], [3, 0, 1]),
  createObservationColorMapping('Y', 'None', 'None', [0, 1, 2], [3, 0, 1]),
  createObservationColorMapping('Na', '2-bar inside', '2-bar outside', [0, 2, 2], [3, 1, 1]),
  createObservationColorMapping('Nb', '2-bar outside', '2-bar inside', [0, 0, 2], [3, 3, 1]),
  createObservationColorMapping('Ga', 'Headlights', '2-bar outside', [0, 3, 0], [1, 2, 2]),
  createObservationColorMapping('Ga', '2-bar inside', 'None', [0, 1, 1], [2, 3, 0]),
  createObservationColorMapping('Ga', 'None', 'None', [0, 1, 2], [3, 2, 0]),
  createObservationColorMapping('Ga', 'None', 'Headlights', [0, 3, 1], [2, 1, 2]),
  createObservationColorMapping('Gb', 'None', '2-bar outside', [0, 2, 1], [2, 0, 0]),
  createObservationColorMapping('Gb', '2-bar inside', 'None', [0, 2, 2], [3, 1, 0]),
  createObservationColorMapping('Gb', 'None', 'Headlights', [0, 2, 1], [2, 0, 2]),
  createObservationColorMapping('Gb', 'Headlights', 'None', [0, 2, 0], [1, 3, 2]),
  createObservationColorMapping('Gc', 'Headlights', 'None', [0, 1, 0], [1, 3, 2]),
  createObservationColorMapping('Gc', 'None', 'None', [0, 2, 1], [2, 3, 0]),
  createObservationColorMapping('Gc', 'None', '2-bar inside', [0, 1, 2], [3, 3, 0]),
  createObservationColorMapping('Gc', '2-bar outside', 'Headlights', [0, 0, 1], [2, 3, 2]),
  createObservationColorMapping('Gd', 'Headlights', 'None', [0, 2, 0], [1, 0, 2]),
  createObservationColorMapping('Gd', 'None', '2-bar inside', [0, 3, 1], [2, 2, 0]),
  createObservationColorMapping('Gd', '2-bar outside', 'None', [0, 0, 2], [3, 2, 0]),
  createObservationColorMapping('Gd', 'None', 'Headlights', [0, 2, 1], [2, 0, 2]),
] as const satisfies readonly ObservationColorMapping[];

const MAPPINGS_BY_TRIPLET = new Map<
  ObservationTripletKey,
  readonly ObservationColorMapping[]
>();

for (const mapping of CANONICAL_OBSERVATION_COLOR_MAPPINGS) {
  const key = createObservationTripletKey(
    mapping.permutation,
    mapping.leftPattern,
    mapping.rightPattern,
  );

  const existing = MAPPINGS_BY_TRIPLET.get(key) ?? [];
  MAPPINGS_BY_TRIPLET.set(key, [...existing, mapping]);
}

export function getObservationColorMappingsForTriplet(
  permutation: PllPermutation,
  leftPattern: FacePattern,
  rightPattern: FacePattern,
): readonly ObservationColorMapping[] {
  return (
    MAPPINGS_BY_TRIPLET.get(
      createObservationTripletKey(permutation, leftPattern, rightPattern),
    ) ?? []
  );
}

function layoutsAreEqual(a: SideColorLayout, b: SideColorLayout): boolean {
  return (
    a.left[0] === b.left[0] &&
    a.left[1] === b.left[1] &&
    a.left[2] === b.left[2] &&
    a.right[0] === b.right[0] &&
    a.right[1] === b.right[1] &&
    a.right[2] === b.right[2]
  );
}

export function findObservationMatchesByObservedLayout(observed: SideColorLayout): {
  mapping: ObservationColorMapping;
  normalizedLayout: SideColorLayout;
  anchorOffset: 0 | 1 | 2 | 3;
}[] {
  const normalized = normalizeObservedColorLayout(observed);

  return CANONICAL_OBSERVATION_COLOR_MAPPINGS.filter((mapping) =>
    layoutsAreEqual(mapping.layout, normalized.layout),
  ).map((mapping) => ({
    mapping,
    normalizedLayout: normalized.layout,
    anchorOffset: normalized.anchorOffset,
  }));
}
