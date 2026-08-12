import { type FacePattern, type PllPermutation } from './pll-catalog';
import {
  normalizeObservedColorLayout,
  type SideColorLayout,
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

function createObservationColorMapping(
  permutation: PllPermutation,
  leftPattern: FacePattern,
  rightPattern: FacePattern,
  left: SideColorLayout['left'],
  right: SideColorLayout['right'],
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
  createObservationColorMapping('Ub', 'Headlights', 'Headlights', [0, 3, 0], [1, 0, 1]),
  createObservationColorMapping('Ub', 'Headlights', 'Solved', [0, 3, 0], [1, 1, 1]),
  createObservationColorMapping('Ub', 'Bar outside', 'Headlights', [0, 0, 0], [1, 3, 1]),
  createObservationColorMapping('Ua', 'Headlights', 'Headlights', [0, 1, 0], [1, 2, 1]),
  createObservationColorMapping('Ua', 'Headlights', 'Headlights', [0, 1, 0], [1, 3, 1]),
  createObservationColorMapping('Ua', 'Headlights', 'Solved', [0, 2, 0], [1, 1, 1]),
  createObservationColorMapping('Ua', 'Bar outside', 'Headlights', [0, 0, 0], [1, 2, 1]),
  createObservationColorMapping('Z', 'Headlights', 'Headlights', [0, 3, 0], [1, 2, 1]),
  createObservationColorMapping('Z', 'Headlights', 'Headlights', [0, 1, 0], [1, 0, 1]),
  createObservationColorMapping('H', 'Headlights', 'Headlights', [0, 2, 0], [1, 3, 1]),
  createObservationColorMapping('Aa', 'Bar inside', 'Bar inside', [0, 1, 1], [2, 2, 0]),
  createObservationColorMapping('Aa', 'Bar outside', 'None', [0, 0, 2], [3, 1, 0]),
  createObservationColorMapping('Aa', 'None', 'Headlights', [0, 2, 1], [2, 3, 2]),
  createObservationColorMapping('Aa', 'None', 'Bar outside', [0, 1, 0], [1, 2, 2]),
  createObservationColorMapping('Ab', 'Bar inside', 'Bar inside', [0, 2, 2], [3, 3, 0]),
  createObservationColorMapping('Ab', 'Bar outside', 'Headlights', [0, 0, 1], [2, 1, 2]),
  createObservationColorMapping('Ab', 'None', 'None', [0, 3, 0], [1, 0, 2]),
  createObservationColorMapping('Ab', 'None', 'Bar outside', [0, 3, 1], [2, 0, 0]),
  createObservationColorMapping('E', 'None', 'None', [0, 3, 2], [3, 0, 1]),
  createObservationColorMapping('E', 'None', 'None', [0, 1, 2], [3, 2, 1]),
  createObservationColorMapping('Ra', 'Headlights', 'Bar inside', [0, 3, 0], [1, 1, 2]),
  createObservationColorMapping('Ra', 'Bar outside', 'Headlights', [0, 0, 1], [2, 1, 0]),
  createObservationColorMapping('Ra', 'None', 'None', [0, 3, 2], [3, 1, 0]),
  createObservationColorMapping('Ra', 'None', 'Bar outside', [0, 2, 1], [2, 1, 2]),
  createObservationColorMapping('Rb', 'Bar inside', 'None', [0, 1, 1], [2, 3, 2]),
  createObservationColorMapping('Rb', 'None', 'None', [0, 1, 0], [1, 0, 2]),
  createObservationColorMapping('Rb', 'None', 'Bar outside', [0, 3, 1], [2, 1, 0]),
  createObservationColorMapping('Rb', 'None', 'Bar outside', [0, 3, 2], [3, 0, 0]),
  createObservationColorMapping('Ja', 'Bar outside', 'Solved', [0, 0, 1], [2, 2, 2]),
  createObservationColorMapping('Ja', 'Solved', 'Bar inside', [0, 0, 0], [1, 1, 2]),
  createObservationColorMapping('Ja', 'Bar outside', 'Bar inside', [0, 0, 1], [2, 2, 0]),
  createObservationColorMapping('Ja', 'Bar outside', 'Bar inside', [0, 0, 2], [3, 3, 0]),
  createObservationColorMapping('Jb', 'Solved', 'Bar outside', [0, 0, 0], [1, 2, 2]),
  createObservationColorMapping('Jb', 'Bar inside', 'Bar outside', [0, 1, 1], [2, 0, 0]),
  createObservationColorMapping('Jb', 'Bar inside', 'Bar outside', [0, 2, 2], [3, 0, 0]),
  createObservationColorMapping('Jb', 'Bar inside', 'Solved', [0, 1, 1], [2, 2, 2]),
  createObservationColorMapping('T', 'Headlights', 'Bar inside', [0, 2, 0], [1, 1, 2]),
  createObservationColorMapping('T', 'Bar outside', 'None', [0, 0, 1], [2, 3, 0]),
  createObservationColorMapping('T', 'None', 'Bar outside', [0, 1, 2], [3, 0, 0]),
  createObservationColorMapping('T', 'Bar inside', 'Headlights', [0, 1, 1], [2, 0, 2]),
  createObservationColorMapping('F', 'Solved', 'None', [0, 0, 0], [1, 3, 2]),
  createObservationColorMapping('F', 'None', 'Headlights', [0, 2, 1], [2, 1, 0]),
  createObservationColorMapping('F', 'None', 'None', [0, 3, 2], [3, 2, 0]),
  createObservationColorMapping('F', 'None', 'Solved', [0, 3, 1], [2, 2, 2]),
  createObservationColorMapping('V', 'Bar inside', 'Bar inside', [0, 2, 2], [3, 3, 1]),
  createObservationColorMapping('V', 'Bar outside', 'None', [0, 0, 2], [3, 2, 1]),
  createObservationColorMapping('V', 'None', 'None', [0, 3, 2], [3, 2, 1]),
  createObservationColorMapping('V', 'None', 'Bar outside', [0, 3, 2], [3, 1, 1]),
  createObservationColorMapping('Y', 'None', 'Bar inside', [0, 1, 2], [3, 3, 1]),
  createObservationColorMapping('Y', 'Bar outside', 'Bar outside', [0, 0, 2], [3, 1, 1]),
  createObservationColorMapping('Y', 'Bar inside', 'None', [0, 2, 2], [3, 0, 1]),
  createObservationColorMapping('Y', 'None', 'None', [0, 1, 2], [3, 0, 1]),
  createObservationColorMapping('Na', 'Bar inside', 'Solved', [0, 2, 2], [3, 1, 1]),
  createObservationColorMapping('Nb', 'Bar outside', 'Headlights', [0, 0, 2], [3, 3, 1]),
  createObservationColorMapping('Ga', 'Headlights', 'Bar outside', [0, 3, 0], [1, 2, 2]),
  createObservationColorMapping('Ga', 'Bar inside', 'None', [0, 1, 1], [2, 3, 0]),
  createObservationColorMapping('Ga', 'None', 'None', [0, 1, 2], [3, 2, 0]),
  createObservationColorMapping('Ga', 'None', 'None', [0, 3, 1], [2, 1, 2]),
  createObservationColorMapping('Gb', 'None', 'Bar outside', [0, 2, 1], [2, 0, 0]),
  createObservationColorMapping('Gb', 'Bar inside', 'None', [0, 2, 2], [3, 1, 0]),
  createObservationColorMapping('Gb', 'None', 'Headlights', [0, 2, 1], [2, 0, 2]),
  createObservationColorMapping('Gb', 'Headlights', 'None', [0, 2, 0], [1, 3, 2]),
  createObservationColorMapping('Gc', 'Headlights', 'None', [0, 1, 0], [1, 3, 2]),
  createObservationColorMapping('Gc', 'None', 'None', [0, 2, 1], [2, 3, 0]),
  createObservationColorMapping('Gc', 'None', 'Bar inside', [0, 1, 2], [3, 3, 0]),
  createObservationColorMapping('Gc', 'None', 'Bar inside', [0, 0, 1], [2, 3, 2]),
  createObservationColorMapping('Gd', 'Headlights', 'Headlights', [0, 2, 0], [1, 0, 2]),
  createObservationColorMapping('Gd', 'None', 'Bar outside', [0, 3, 1], [2, 2, 0]),
  createObservationColorMapping('Gd', 'Bar outside', 'Bar outside', [0, 0, 2], [3, 2, 0]),
  createObservationColorMapping('Gd', 'None', 'Headlights', [0, 3, 1], [2, 0, 2]),
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
