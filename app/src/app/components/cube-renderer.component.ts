import { Component, inject } from '@angular/core';
import { CubeStateService } from '../services/cube-state.service';
import { AppearanceService } from '../services/appearance.service';
import { type SideColorIndex } from '../domain/observation-color-layout';

// Isometric cube geometry — see docs/initial-design.md section 12.2.
// Top face diamond: TOP=(165,0), RIGHT=(330,129), BOTTOM=(165,258), LEFT=(0,129)
// Left visible face hangs from TOP to LEFT edge of diamond.
// Right visible face hangs from RIGHT to BOTTOM edge of diamond.
// Per-sticker vectors: step-right=(+55,+43), step-forward=(-55,+43), step-down=(0,+70).

const A = 55;    // horizontal isometric step per sticker
const B = 43;    // vertical isometric step per sticker (top face)
const SH = 70;   // sticker height on side faces
const OX = 165;  // x-origin: top corner of the top-face diamond

function pts(corners: [number, number][]): string {
  return corners.map(([x, y]) => `${x},${y}`).join(' ');
}

function topPts(r: number, c: number): string {
  return pts([
    [OX + A * (c - r),     B * (c + r)    ],
    [OX + A * (c - r + 1), B * (c + r + 1)],
    [OX + A * (c - r),     B * (c + r + 2)],
    [OX + A * (c - r - 1), B * (c + r + 1)],
  ]);
}

function leftPts(lr: number, lc: number): string {
  return pts([
    [OX - A * lc,       B * lc       + lr * SH       ],
    [OX - A * (lc + 1), B * (lc + 1) + lr * SH       ],
    [OX - A * (lc + 1), B * (lc + 1) + (lr + 1) * SH ],
    [OX - A * lc,       B * lc       + (lr + 1) * SH ],
  ]);
}

function rightPts(lr: number, rc: number): string {
  return pts([
    [OX + 3 * A - A * rc,       3 * B + B * rc       + lr * SH       ],
    [OX + 3 * A - A * (rc + 1), 3 * B + B * (rc + 1) + lr * SH       ],
    [OX + 3 * A - A * (rc + 1), 3 * B + B * (rc + 1) + (lr + 1) * SH ],
    [OX + 3 * A - A * rc,       3 * B + B * rc       + (lr + 1) * SH ],
  ]);
}

interface StickerDef {
  face: 'top' | 'left' | 'right';
  row: number;  // side faces: 0=U-layer PLL stickers, 1-2=solved layers
  col: number;  // side faces: 0=outer (away from other face), 2=inner (adjacent)
  points: string;
}

// Draw order: left -> right -> top (top last so it covers the side-face junctions)
const ALL_STICKERS: StickerDef[] = [
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'left', row: Math.floor(i / 3), col: i % 3, points: leftPts(Math.floor(i / 3), i % 3),
  })),
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'right', row: Math.floor(i / 3), col: i % 3, points: rightPts(Math.floor(i / 3), i % 3),
  })),
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'top', row: Math.floor(i / 3), col: i % 3, points: topPts(Math.floor(i / 3), i % 3),
  })),
];

@Component({
  selector: 'app-cube-renderer',
  standalone: true,
  template: `
    @if (displayState()) {
      <svg
        viewBox="-5 -5 340 480"
        xmlns="http://www.w3.org/2000/svg"
        style="width:100%;height:auto;display:block">
        @for (sticker of stickers; track sticker.face + '-' + sticker.row + '-' + sticker.col) {
          <polygon
            [attr.data-face]="sticker.face"
            [attr.data-sticker]="sticker.face + '-' + sticker.row + '-' + sticker.col"
            [attr.data-sticker-row]="sticker.row"
            [attr.data-sticker-col]="sticker.col"
            [attr.points]="sticker.points"
            [attr.fill]="fillFor(sticker)"
            stroke="#1a1a1a"
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
    if (sticker.row === 0) {
      // U-layer row: PLL recognition stickers from display state
      const face = sticker.face === 'left' ? state.leftFace : state.rightFace;
      return this.appearanceService.sideIndexToColor(face[sticker.col] as SideColorIndex);
    }
    // Bottom two rows: solved layers with randomly chosen sequential color pair
    const base: SideColorIndex = sticker.face === 'left'
      ? state.solvedBase
      : ((state.solvedBase + 1) % 4) as SideColorIndex;
    return this.appearanceService.sideIndexToColor(base);
  }
}
