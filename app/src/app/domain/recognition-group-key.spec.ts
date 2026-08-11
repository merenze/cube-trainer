import { createRecognitionGroupKey, splitRecognitionGroupKey } from './recognition-group-key';

describe('recognition group key helpers', () => {
  it('should preserve ordered left and right patterns', () => {
    const leftToRight = createRecognitionGroupKey('Headlights', 'Bar inside');
    const rightToLeft = createRecognitionGroupKey('Bar inside', 'Headlights');

    expect(leftToRight).toBe('Headlights|Bar inside');
    expect(rightToLeft).toBe('Bar inside|Headlights');
    expect(leftToRight).not.toBe(rightToLeft);
  });

  it('should split a composite key back to its ordered patterns', () => {
    const key = createRecognitionGroupKey('Solved', 'None');

    expect(splitRecognitionGroupKey(key)).toEqual({
      left: 'Solved',
      right: 'None',
    });
  });
});
