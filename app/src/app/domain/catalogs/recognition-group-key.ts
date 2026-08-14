import { type FacePattern } from './pll-catalog';

const KEY_DELIMITER = '|';

export type RecognitionGroupKey = `${FacePattern}${typeof KEY_DELIMITER}${FacePattern}`;

export type RecognitionGroupComposite = {
  left: FacePattern;
  right: FacePattern;
};

export function createRecognitionGroupKey(
  left: FacePattern,
  right: FacePattern,
): RecognitionGroupKey {
  return `${left}${KEY_DELIMITER}${right}`;
}

export function splitRecognitionGroupKey(
  key: RecognitionGroupKey,
): RecognitionGroupComposite {
  const delimiterIndex = key.indexOf(KEY_DELIMITER);

  return {
    left: key.slice(0, delimiterIndex) as FacePattern,
    right: key.slice(delimiterIndex + 1) as FacePattern,
  };
}
