import { CaseOrderingStrategy } from './case-ordering-strategy';
import { type EligibleObservation } from './eligible-observation.service';

// Mock implementation for testing the abstraction
class MockOrderingStrategy implements CaseOrderingStrategy {
  order(observations: readonly EligibleObservation[]): readonly EligibleObservation[] {
    return [...observations];
  }
}

describe('CaseOrderingStrategy abstraction', () => {
  let strategy: CaseOrderingStrategy;

  beforeEach(() => {
    strategy = new MockOrderingStrategy();
  });

  it('should order a list of eligible observations', () => {
    // Create mock observations
    const observations: EligibleObservation[] = [
      {
        candidate: 'Ua',
        triplet: ['Ua', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
      },
      {
        candidate: 'Ub',
        triplet: ['Ub', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 2, 0] as const, right: [1, 0, 1] as const }],
      },
      {
        candidate: 'Z',
        triplet: ['Z', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 3, 0] as const, right: [1, 2, 1] as const }],
      },
    ];

    const ordered = strategy.order(observations);

    expect(ordered).toBeTruthy();
    expect(Array.isArray(ordered)).toBe(true);
  });

  it('should return empty array when given empty observations', () => {
    const ordered = strategy.order([]);
    expect(ordered).toEqual([]);
  });

  it('should preserve all observations in the result', () => {
    const observations: EligibleObservation[] = [
      {
        candidate: 'Ua',
        triplet: ['Ua', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
      },
      {
        candidate: 'Ub',
        triplet: ['Ub', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 2, 0] as const, right: [1, 0, 1] as const }],
      },
    ];

    const ordered = strategy.order(observations);

    expect(ordered.length).toBe(observations.length);
    expect(ordered.some((o) => o.candidate === 'Ua')).toBe(true);
    expect(ordered.some((o) => o.candidate === 'Ub')).toBe(true);
  });

  it('should handle single observation', () => {
    const observations: EligibleObservation[] = [
      {
        candidate: 'Ua',
        triplet: ['Ua', 'Headlights', 'Headlights'],
        colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
      },
    ];

    const ordered = strategy.order(observations);

    expect(ordered.length).toBe(1);
    expect(ordered[0]?.candidate).toBe('Ua');
  });
});
