import { Component, inject } from '@angular/core';
import { CubeStateService } from '../services/cube-state.service';
import { AppearanceService } from '../services/appearance.service';
import { type SideColorIndex } from '../domain/observation-color-layout';

// Presentation geometry for the orthographic cube view.
// viewBox: 0 0 270 240
// Top face: 3x3 grid of 60x60 squares arranged in a 3x3 layout at y=0
// Left face: 3 stickers (60x60 each) arranged horizontally below-left
// Right face: 3 stickers (60x60 each) arranged horizontally below-right
// Layout: top face centered at x=45..225, y=10..190; side faces below

const S = 56; // sticker size
const G = 4;  // gap between stickers
const UNIT = S + G; // 60px per cell

// Top face: 9 stickers in a 3x3 grid, top-left origin at (15, 10)
const TOP_X = 15;
const TOP_Y = 10;

// Side faces: one row of 3 stickers each, below the bottom row of the top face
const SIDE_Y = TOP_Y + 3 * UNIT + G;

// Left face starts at same x as top face
const LEFT_X = TOP_X;

// Right face starts aligned to the right of the top face
const RIGHT_X = TOP_X + 3 * UNIT + G;

function rect(x: number, y: number): string {
  return `${x},${y} ${x + S},${y} ${x + S},${y + S} ${x},${y + S}`;
}

interface StickerDef {
  face: 'top' | 'left' | 'right';
  index: number;
  points: string;
}

const TOP_STICKERS: StickerDef[] = Array.from({ length: 9 }, (_, i) => ({
  face: 'top' as const,
  index: i,
  points: rect(TOP_X + (i % 3) * UNIT, TOP_Y + Math.floor(i / 3) * UNIT),
}));

const LEFT_STICKERS: StickerDef[] = Array.from({ length: 3 }, (_, i) => ({
  face: 'left' as const,
  index: i,
  points: rect(LEFT_X + i * UNIT, SIDE_Y),
}));

const RIGHT_STICKERS: StickerDef[] = Array.from({ length: 3 }, (_, i) => ({
  face: 'right' as const,
  index: i,
  points: rect(RIGHT_X + i * UNIT, SIDE_Y),
}));

const ALL_STICKERS: StickerDef[] = [...TOP_STICKERS, ...LEFT_STICKERS, ...RIGHT_STICKERS];

@Component({
  selector: 'app-cube-renderer',
  standalone: true,
  template: `
    @if (displayState()) {
      <svg
        viewBox="0 0 270 240"
        xmlns="http://www.w3.org/2000/svg"
        style="width:100%;height:auto;display:block">
        @for (sticker of stickers; track sticker.face + '-' + sticker.index) {
          <polygon
            [attr.data-face]="sticker.face"
            [attr.data-sticker]="sticker.face + '-' + sticker.index"
            [attr.points]="sticker.points"
            [attr.fill]="fillFor(sticker)"
            stroke="#333333"
            stroke-width="2"
          />
        }
      </svg>
    }
  `,
})
export class CubeRendererComponent {
  private cubeStateService = inject(CubeStateService);
  private appearanceService = inject(AppearanceService);

  protected readonly displayState = this.cubeStateService.displayState;
  protected readonly stickers = ALL_STICKERS;

  protected fillFor(sticker: StickerDef): string {
    const state = this.displayState();
    if (sticker.face === 'top') {
      return this.appearanceService.topColor;
    }
    if (!state) {
      return this.appearanceService.topColor;
    }
    const face = sticker.face === 'left' ? state.leftFace : state.rightFace;
    return this.appearanceService.sideIndexToColor(face[sticker.index] as SideColorIndex);
  }
}
