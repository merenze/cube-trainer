import { TestBed } from '@angular/core/testing';
import { RandomColorAnchorStrategy } from './random-color-anchor-strategy';
import { type EligibleObservation } from './eligible-observation.service';
import { normalizeObservedColorLayout } from '../domain/observation-color-layout';

function makeObs(left: [number,number,number], right: [number,number,number]): EligibleObservation {
  return {
    candidate: 'Ua' as any,
    triplet: ['Ua' as any, 'Headlights', 'Headlights'],
    colorLayoutVariants: [{ left: left as any, right: right as any }],
  };
}

describe('RandomColorAnchorStrategy', () => {
  let strategy: RandomColorAnchorStrategy;

  beforeEach(() => {
    strategy = new RandomColorAnchorStrategy();
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should return a layout with 3-element left and right tuples', () => {
    const obs = makeObs([0, 1, 0], [1, 2, 1]);
    const layout = strategy.selectLayout(obs);

    expect(layout.left.length).toBe(3);
    expect(layout.right.length).toBe(3);
  });

  it('should return a layout that normalizes back to the canonical layout', () => {
    const obs = makeObs([0, 1, 0], [1, 2, 1]);

    const layout = strategy.selectLayout(obs);

    // Any valid anchor rotation must normalize back to the canonical layout
    const normalized = normalizeObservedColorLayout(layout);
    expect(normalized.layout).toEqual({ left: [0, 1, 0], right: [1, 2, 1] });
  });

  it('should produce varied anchor offsets across multiple calls (statistical)', () => {
    const obs = makeObs([0, 1, 0], [1, 2, 1]);
    const firstLayouts = new Set<string>();

    for (let i = 0; i < 40; i++) {
      const layout = strategy.selectLayout(obs);
      firstLayouts.add(JSON.stringify(layout.left));
    }

    // With 4 possible offsets, 40 calls should produce more than 1 unique result
    expect(firstLayouts.size).toBeGreaterThan(1);
  });

  it('should return all four possible rotations across enough calls', () => {
    const obs = makeObs([0, 1, 0], [1, 2, 1]);
    const results = new Set<number>();

    for (let i = 0; i < 200; i++) {
      const layout = strategy.selectLayout(obs);
      results.add(layout.left[0]); // left[0] is the anchor index
    }

    // All four anchor values 0-3 should appear
    expect(results.size).toBe(4);
  });
});
