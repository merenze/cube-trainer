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
  '2-bar inside',
  '2-bar outside',
  'None',
  '3-bar',
] as const;

export type PllPermutation = (typeof PLL_PERMUTATIONS)[number];
export type FacePattern = (typeof FACE_PATTERNS)[number];
