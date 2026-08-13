import { rotateColorLayout, type SideColorLayout } from './observation-color-layout';
import {
  CANONICAL_OBSERVATION_COLOR_MAPPINGS,
  createObservationTripletKey,
  findObservationMatchesByObservedLayout,
  getObservationColorMappingsForTriplet,
} from './observation-color-catalog';

describe('observation color catalog', () => {
  it('should include canonical rows for known triplets', () => {
    const mappings = getObservationColorMappingsForTriplet(
      'Ub',
      'Headlights',
      'Headlights',
    );

    expect(mappings.length).toBe(1);
    expect(mappings.map((mapping) => mapping.layout)).toContainEqual({
      left: [0, 2, 0],
      right: [1, 0, 1],
    });
  });

  it('should expose stable triplet keys for map usage', () => {
    const key = createObservationTripletKey('Ua', 'Headlights', 'Headlights');
    expect(key).toBe('Ua|Headlights|Headlights');
  });

  it('should match a rotated observed layout to its normalized catalog row', () => {
    const base = getObservationColorMappingsForTriplet('H', 'Headlights', 'Headlights')[0]
      .layout;
    const observed = rotateColorLayout(base, 2);

    const matches = findObservationMatchesByObservedLayout(observed);

    expect(matches.some((match) => match.mapping.permutation === 'H')).toBe(true);

    const hMatch = matches.find((match) => match.mapping.permutation === 'H');
    expect(hMatch?.normalizedLayout).toEqual(base);
    expect(hMatch?.anchorOffset).toBe(2);
  });

  it('should return no matches for a layout absent from the catalog', () => {
    const impossibleLayout: SideColorLayout = {
      left: [0, 0, 0],
      right: [0, 0, 0],
    };

    expect(findObservationMatchesByObservedLayout(impossibleLayout)).toEqual([]);
  });

  it('should expose a non-empty canonical mapping collection', () => {
    expect(CANONICAL_OBSERVATION_COLOR_MAPPINGS.length).toBeGreaterThan(0);
  });

  it('should include the full canonical mapping row set from the design dataset', () => {
    expect(CANONICAL_OBSERVATION_COLOR_MAPPINGS.length).toBe(68);
  });

  it('should keep all canonical rows normalized with Left_0 equal to zero', () => {
    expect(
      CANONICAL_OBSERVATION_COLOR_MAPPINGS.every(
        (mapping) => mapping.layout.left[0] === 0,
      ),
    ).toBe(true);
  });

  it('should keep all canonical side-color indices in the 0..3 range', () => {
    const allIndices = CANONICAL_OBSERVATION_COLOR_MAPPINGS.flatMap((mapping) => [
      ...mapping.layout.left,
      ...mapping.layout.right,
    ]);

    expect(allIndices.every((index) => index >= 0 && index <= 3)).toBe(true);
  });
});
