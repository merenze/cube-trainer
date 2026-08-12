import { type ColorAnchorStrategy, COLOR_ANCHOR_STRATEGY } from './color-anchor-strategy';
import { type EligibleObservation } from './eligible-observation.service';
import { type SideColorLayout } from '../domain/observation-color-layout';

class FixedAnchorStrategy implements ColorAnchorStrategy {
  selectLayout(observation: EligibleObservation): SideColorLayout {
    return observation.colorLayoutVariants[0]!;
  }
}

function makeObs(candidate: string): EligibleObservation {
  return {
    candidate: candidate as any,
    triplet: [candidate as any, 'Headlights', 'Headlights'],
    colorLayoutVariants: [
      { left: [0, 1, 0] as const, right: [1, 2, 1] as const },
      { left: [1, 2, 1] as const, right: [2, 3, 2] as const },
    ],
  };
}

describe('ColorAnchorStrategy abstraction', () => {
  let strategy: ColorAnchorStrategy;

  beforeEach(() => {
    strategy = new FixedAnchorStrategy();
  });

  it('should select a layout from the observation', () => {
    const obs = makeObs('Ua');
    const layout = strategy.selectLayout(obs);

    expect(layout).toBeTruthy();
    expect(layout.left).toBeDefined();
    expect(layout.right).toBeDefined();
  });

  it('should return a layout whose left and right are 3-element tuples', () => {
    const obs = makeObs('Ua');
    const layout = strategy.selectLayout(obs);

    expect(layout.left.length).toBe(3);
    expect(layout.right.length).toBe(3);
  });

  it('should return one of the observation color layout variants', () => {
    const obs = makeObs('Ua');
    const layout = strategy.selectLayout(obs);

    const isVariant = obs.colorLayoutVariants.some(
      (v) =>
        v.left[0] === layout.left[0] &&
        v.left[1] === layout.left[1] &&
        v.left[2] === layout.left[2] &&
        v.right[0] === layout.right[0] &&
        v.right[1] === layout.right[1] &&
        v.right[2] === layout.right[2],
    );

    expect(isVariant).toBe(true);
  });

  it('should handle observations with a single color layout variant', () => {
    const obs: EligibleObservation = {
      candidate: 'Ua' as any,
      triplet: ['Ua' as any, 'Headlights', 'Headlights'],
      colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
    };

    const layout = strategy.selectLayout(obs);

    expect(layout).toEqual({ left: [0, 1, 0], right: [1, 2, 1] });
  });

  it('COLOR_ANCHOR_STRATEGY token should be defined', () => {
    expect(COLOR_ANCHOR_STRATEGY).toBeTruthy();
  });
});
