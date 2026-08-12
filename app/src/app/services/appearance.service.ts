import { Injectable } from '@angular/core';
import { type SideColorIndex } from '../domain/observation-color-layout';

// Sequence: Red → Green → Orange → Blue (with yellow on top)
const SIDE_COLORS: readonly [string, string, string, string] = [
  '#C41E3A',
  '#009E60',
  '#FF5800',
  '#003AA6',
];

@Injectable({
  providedIn: 'root',
})
export class AppearanceService {
  readonly topColor = '#FFD500';

  sideIndexToColor(index: SideColorIndex): string {
    return SIDE_COLORS[index];
  }
}
