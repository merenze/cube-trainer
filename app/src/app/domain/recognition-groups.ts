import { type FacePattern, type PllPermutation } from './pll-catalog';
import {
  createRecognitionGroupKey,
  type RecognitionGroupKey,
} from './recognition-group-key';

export type RecognitionGroup = {
  key: RecognitionGroupKey;
  leftPattern: FacePattern;
  rightPattern: FacePattern;
  candidates: readonly PllPermutation[];
};

function createRecognitionGroup(
  leftPattern: FacePattern,
  rightPattern: FacePattern,
  candidates: readonly PllPermutation[],
): RecognitionGroup {
  return {
    key: createRecognitionGroupKey(leftPattern, rightPattern),
    leftPattern,
    rightPattern,
    candidates,
  };
}

export const CANONICAL_RECOGNITION_GROUPS = [
  createRecognitionGroup('None', '3-bar', ['F']),
  createRecognitionGroup('3-bar', 'None', ['F']),
  createRecognitionGroup('2-bar outside', '3-bar', ['Ja']),
  createRecognitionGroup('3-bar', '2-bar inside', ['Ja']),
  createRecognitionGroup('2-bar inside', '3-bar', ['Jb']),
  createRecognitionGroup('3-bar', '2-bar outside', ['Jb']),
  createRecognitionGroup('2-bar outside', '2-bar outside', ['Y']),
  createRecognitionGroup('2-bar inside', '2-bar inside', ['Aa', 'Ab']),
  createRecognitionGroup('Headlights', '2-bar outside', ['Aa', 'Ga']),
  createRecognitionGroup('2-bar outside', 'Headlights', ['Ab', 'Gc']),
  createRecognitionGroup('2-bar inside', 'None', ['Ga', 'Y']),
  createRecognitionGroup('2-bar outside', '2-bar inside', ['Ja', 'Nb']),
  createRecognitionGroup('2-bar inside', '2-bar outside', ['Na', 'V']),
  createRecognitionGroup('Headlights', '2-bar inside', ['Ra', 'T']),
  createRecognitionGroup('2-bar inside', 'Headlights', ['Rb', 'T']),
  createRecognitionGroup('Headlights', '3-bar', ['Ua', 'Ub']),
  createRecognitionGroup('3-bar', 'Headlights', ['Ua', 'Ub']),
  createRecognitionGroup('None', '2-bar inside', ['Gc', 'Gd', 'Y']),
  createRecognitionGroup('Headlights', 'Headlights', ['H', 'Ua', 'Ub', 'Z']),
  createRecognitionGroup('None', 'Headlights', ['Aa', 'Ga', 'Gb', 'Gd', 'Ra']),
  createRecognitionGroup('2-bar outside', 'None', ['Aa', 'Gd', 'Ra', 'T', 'V']),
  createRecognitionGroup('Headlights', 'None', ['Ab', 'Gb', 'Gc', 'Gd', 'Rb']),
  createRecognitionGroup('None', '2-bar outside', ['Ab', 'Gb', 'Rb', 'T', 'V']),
  createRecognitionGroup('None', 'None', ['E', 'F', 'Ga', 'Gc', 'Ra', 'Rb', 'V', 'Y']),
] as const satisfies readonly RecognitionGroup[];

const RECOGNITION_GROUP_MAP = new Map<RecognitionGroupKey, RecognitionGroup>(
  CANONICAL_RECOGNITION_GROUPS.map((group) => [group.key, group]),
);

export function getRecognitionGroupByPatterns(
  leftPattern: FacePattern,
  rightPattern: FacePattern,
): RecognitionGroup | undefined {
  return RECOGNITION_GROUP_MAP.get(
    createRecognitionGroupKey(leftPattern, rightPattern),
  );
}

export function isValidRecognitionComposite(
  leftPattern: FacePattern,
  rightPattern: FacePattern,
): boolean {
  return getRecognitionGroupByPatterns(leftPattern, rightPattern) !== undefined;
}
