import { Component, inject } from '@angular/core';
import { CubeStateService } from '../services/cube-state.service';
import { AppearanceService } from '../services/appearance.service';
import { type SideColorIndex } from '../../../domain';

type Point = [number, number];

// Explicit face anchors chosen to satisfy straight-edge and angle-order constraints.
const TOP: Point = [151, 102];
const LEFT_TOP: Point = [-7, 130];
const RIGHT_TOP: Point = [337, 130];
const FRONT_TOP: Point = [165, 185];
const FRONT_BOTTOM: Point = [165, 404];
const LEFT_BOTTOM: Point = [1, 315];
const RIGHT_BOTTOM: Point = [329, 315];

function lerp(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function buildFaceGrid(topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point): Point[][] {
  return Array.from({ length: 4 }, (_, row) => {
    const t = row / 3;
    const left = lerp(topLeft, bottomLeft, t);
    const right = lerp(topRight, bottomRight, t);
    return Array.from({ length: 4 }, (_, col) => lerp(left, right, col / 3));
  });
}

function cellPoints(grid: Point[][], row: number, col: number): string {
  const points = [
    grid[row][col],
    grid[row][col + 1],
    grid[row + 1][col + 1],
    grid[row + 1][col],
  ];
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

const TOP_GRID = buildFaceGrid(TOP, RIGHT_TOP, FRONT_TOP, LEFT_TOP);
const LEFT_GRID = buildFaceGrid(LEFT_TOP, FRONT_TOP, FRONT_BOTTOM, LEFT_BOTTOM);
// Right face is ordered so col=0 remains the outside edge and col=2 remains inside edge.
const RIGHT_GRID = buildFaceGrid(RIGHT_TOP, FRONT_TOP, FRONT_BOTTOM, RIGHT_BOTTOM);

interface StickerDef {
  face: 'top' | 'left' | 'right';
  row: number;  // side faces: 0=U-layer PLL stickers, 1-2=solved layers
  col: number;  // side faces: 0=outer (away from other face), 2=inner (adjacent)
  points: string;
}

// Draw order: left -> right -> top (top last so it covers the side-face junctions)
const ALL_STICKERS: StickerDef[] = [
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'left', row: Math.floor(i / 3), col: i % 3, points: cellPoints(LEFT_GRID, Math.floor(i / 3), i % 3),
  })),
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'right', row: Math.floor(i / 3), col: i % 3, points: cellPoints(RIGHT_GRID, Math.floor(i / 3), i % 3),
  })),
  ...Array.from({ length: 9 }, (_, i): StickerDef => ({
    face: 'top', row: Math.floor(i / 3), col: i % 3, points: cellPoints(TOP_GRID, Math.floor(i / 3), i % 3),
  })),
];

@Component({
  selector: 'app-cube-renderer',
  standalone: true,
  template: `
    @if (displayState()) {
      <svg
        viewBox="-25 -10 380 490"
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
      const col = sticker.face === 'right' ? 2 - sticker.col : sticker.col;
      const face = sticker.face === 'left' ? state.leftFace : state.rightFace;
      return this.appearanceService.sideIndexToColor(face[col] as SideColorIndex);
    }
    // Bottom two rows: solved layers with randomly chosen sequential color pair
    const base: SideColorIndex = sticker.face === 'left'
      ? state.solvedBase
      : ((state.solvedBase + 1) % 4) as SideColorIndex;
    return this.appearanceService.sideIndexToColor(base);
  }
}
