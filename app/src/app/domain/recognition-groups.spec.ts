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
    expect(getRecognitionGroupByPatterns('None', '2-bar inside')?.candidates).toEqual([
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

  it('should treat 3-bar | 3-bar as invalid for v1 recognition groups', () => {
    expect(getRecognitionGroupByPatterns('3-bar', '3-bar')).toBeUndefined();
    expect(isValidRecognitionComposite('3-bar', '3-bar')).toBe(false);
  });

  it('should validate known canonical composites as valid', () => {
    expect(isValidRecognitionComposite('None', 'None')).toBe(true);
    expect(isValidRecognitionComposite('3-bar', 'None')).toBe(true);
  });
});
