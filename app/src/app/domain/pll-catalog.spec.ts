import { FACE_PATTERNS, PLL_PERMUTATIONS } from './pll-catalog';

describe('pll catalog', () => {
  it('should expose exactly 21 canonical PLL permutations', () => {
    expect(PLL_PERMUTATIONS.length).toBe(21);
    expect(PLL_PERMUTATIONS).toContain('Aa');
    expect(PLL_PERMUTATIONS).toContain('Ub');
    expect(PLL_PERMUTATIONS).toContain('Z');
  });

  it('should expose exactly five canonical face patterns', () => {
    expect(FACE_PATTERNS).toEqual([
      'Headlights',
      '2-bar inside',
      '2-bar outside',
      'None',
      '3-bar',
    ]);
  });
});
