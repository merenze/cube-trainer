import { type FacePattern, type PllPermutation } from './pll-catalog';
import {
  normalizeObservedColorLayout,
  type SideColorLayout,
} from './observation-color-layout';

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
  createObservationColorMapping('Ua', 'Headlights', 'Headlights', [0, 1, 0], [1, 2, 1]),
  createObservationColorMapping('Ua', 'Headlights', 'Headlights', [0, 1, 0], [1, 3, 1]),
  createObservationColorMapping('H', 'Headlights', 'Headlights', [0, 2, 0], [1, 3, 1]),
  createObservationColorMapping('Gd', 'Headlights', 'Headlights', [0, 2, 0], [1, 0, 2]),
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
