import { ShuffledBagOrderingStrategy } from './shuffled-bag-ordering-strategy';
import { type EligibleObservation } from '../../../services/eligible-observation.service';

function makeObs(candidate: string): EligibleObservation {
  return {
    candidate: candidate as any,
    triplet: [candidate as any, 'Headlights', 'Headlights'],
    colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
  };
}

describe('ShuffledBagOrderingStrategy', () => {
  let strategy: ShuffledBagOrderingStrategy;

  beforeEach(() => {
    strategy = new ShuffledBagOrderingStrategy();
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should return empty array when given empty observations', () => {
    const ordered = strategy.order([]);
    expect(ordered).toEqual([]);
  });

  it('should return all observations when called with a list', () => {
    const observations = [makeObs('Ua'), makeObs('Ub'), makeObs('Z')];
    const ordered = strategy.order(observations);
    expect(ordered.length).toBe(observations.length);
  });

  it('should contain all input observations in the result', () => {
    const observations = [makeObs('Ua'), makeObs('Ub'), makeObs('Z')];
    const ordered = strategy.order(observations);

    const candidates = ordered.map((o) => o.candidate);
    expect(candidates).toContain('Ua');
    expect(candidates).toContain('Ub');
    expect(candidates).toContain('Z');
  });

  it('should produce a different order than input on repeated calls (statistical)', () => {
    // With 10 items, the chance of all 100 shuffles matching original order is negligible
    const observations = Array.from({ length: 10 }, (_, i) => makeObs(`case${i}`));
    const originalOrder = observations.map((o) => o.candidate).join(',');

    let differentCount = 0;
    for (let i = 0; i < 20; i++) {
      const ordered = strategy.order(observations);
      const orderedStr = ordered.map((o) => o.candidate).join(',');
      if (orderedStr !== originalOrder) {
        differentCount++;
      }
    }

    // At least some shuffles should differ from original order
    expect(differentCount).toBeGreaterThan(0);
  });

  it('should return a frozen/readonly array', () => {
    const observations = [makeObs('Ua'), makeObs('Ub')];
    const ordered = strategy.order(observations);

    expect(Object.isFrozen(ordered)).toBe(true);
  });

  it('should not include duplicate observations in a single ordering', () => {
    const observations = [makeObs('Ua'), makeObs('Ub'), makeObs('Z'), makeObs('H')];
    const ordered = strategy.order(observations);

    const candidates = ordered.map((o) => o.candidate);
    const uniqueCandidates = new Set(candidates);
    expect(uniqueCandidates.size).toBe(observations.length);
  });
});
