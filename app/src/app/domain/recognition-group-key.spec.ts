import { createRecognitionGroupKey, splitRecognitionGroupKey } from './recognition-group-key';

describe('recognition group key helpers', () => {
  it('should preserve ordered left and right patterns', () => {
    const leftToRight = createRecognitionGroupKey('Headlights', '2-bar inside');
    const rightToLeft = createRecognitionGroupKey('2-bar inside', 'Headlights');

    expect(leftToRight).toBe('Headlights|2-bar inside');
    expect(rightToLeft).toBe('2-bar inside|Headlights');
    expect(leftToRight).not.toBe(rightToLeft);
  });

  it('should split a composite key back to its ordered patterns', () => {
    const key = createRecognitionGroupKey('3-bar', 'None');

    expect(splitRecognitionGroupKey(key)).toEqual({
      left: '3-bar',
      right: 'None',
    });
  });
});
