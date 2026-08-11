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
  createRecognitionGroup('None', 'Solved', ['F']),
  createRecognitionGroup('Solved', 'None', ['F']),
  createRecognitionGroup('Bar outside', 'Solved', ['Ja']),
  createRecognitionGroup('Solved', 'Bar inside', ['Ja']),
  createRecognitionGroup('Bar inside', 'Solved', ['Jb']),
  createRecognitionGroup('Solved', 'Bar outside', ['Jb']),
  createRecognitionGroup('Bar outside', 'Bar outside', ['Y']),
  createRecognitionGroup('Bar inside', 'Bar inside', ['Aa', 'Ab']),
  createRecognitionGroup('Headlights', 'Bar outside', ['Aa', 'Ga']),
  createRecognitionGroup('Bar outside', 'Headlights', ['Ab', 'Gc']),
  createRecognitionGroup('Bar inside', 'None', ['Ga', 'Y']),
  createRecognitionGroup('Bar outside', 'Bar inside', ['Ja', 'Nb']),
  createRecognitionGroup('Bar inside', 'Bar outside', ['Na', 'V']),
  createRecognitionGroup('Headlights', 'Bar inside', ['Ra', 'T']),
  createRecognitionGroup('Bar inside', 'Headlights', ['Rb', 'T']),
  createRecognitionGroup('Headlights', 'Solved', ['Ua', 'Ub']),
  createRecognitionGroup('Solved', 'Headlights', ['Ua', 'Ub']),
  createRecognitionGroup('None', 'Bar inside', ['Gc', 'Gd', 'Y']),
  createRecognitionGroup('Headlights', 'Headlights', ['H', 'Ua', 'Ub', 'Z']),
  createRecognitionGroup('None', 'Headlights', ['Aa', 'Ga', 'Gb', 'Gd', 'Ra']),
  createRecognitionGroup('Bar outside', 'None', ['Aa', 'Gd', 'Ra', 'T', 'V']),
  createRecognitionGroup('Headlights', 'None', ['Ab', 'Gb', 'Gc', 'Gd', 'Rb']),
  createRecognitionGroup('None', 'Bar outside', ['Ab', 'Gb', 'Rb', 'T', 'V']),
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
