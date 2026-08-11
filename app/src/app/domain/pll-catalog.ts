export const PLL_PERMUTATIONS = [
  'Aa',
  'Ab',
  'E',
  'F',
  'Ga',
  'Gb',
  'Gc',
  'Gd',
  'H',
  'Ja',
  'Jb',
  'Na',
  'Nb',
  'Ra',
  'Rb',
  'T',
  'Ua',
  'Ub',
  'V',
  'Y',
  'Z',
] as const;

export const FACE_PATTERNS = [
  'Headlights',
  'Bar inside',
  'Bar outside',
  'None',
  'Solved',
] as const;

export type PllPermutation = (typeof PLL_PERMUTATIONS)[number];
export type FacePattern = (typeof FACE_PATTERNS)[number];
