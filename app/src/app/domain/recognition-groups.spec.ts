import {
  CANONICAL_RECOGNITION_GROUPS,
  getRecognitionGroupByPatterns,
  isValidRecognitionComposite,
} from './recognition-groups';

describe('canonical recognition groups', () => {
  it('should define exactly 24 canonical recognition groups', () => {
    expect(CANONICAL_RECOGNITION_GROUPS.length).toBe(24);
  });

  it('should expose expected candidates for known composites', () => {
    expect(getRecognitionGroupByPatterns('None', 'Bar inside')?.candidates).toEqual([
      'Gc',
      'Gd',
      'Y',
    ]);
    expect(getRecognitionGroupByPatterns('Headlights', 'Headlights')?.candidates).toEqual([
      'H',
      'Ua',
      'Ub',
      'Z',
    ]);
  });

  it('should treat Solved | Solved as invalid for v1 recognition groups', () => {
    expect(getRecognitionGroupByPatterns('Solved', 'Solved')).toBeUndefined();
    expect(isValidRecognitionComposite('Solved', 'Solved')).toBe(false);
  });

  it('should validate known canonical composites as valid', () => {
    expect(isValidRecognitionComposite('None', 'None')).toBe(true);
    expect(isValidRecognitionComposite('Solved', 'None')).toBe(true);
  });
});
