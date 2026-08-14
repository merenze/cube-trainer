import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CubeRendererComponent } from './cube-renderer.component';
import { CubeStateService, type CubeDisplayState } from '../services/cube-state.service';
import { AppearanceService } from '../services/appearance.service';

class StubCubeStateService {
  private readonly _displayState = signal<CubeDisplayState | null>(null);
  readonly displayState = this._displayState.asReadonly();
  setState(state: CubeDisplayState | null): void { this._displayState.set(state); }
}

const KNOWN_STATE: CubeDisplayState = {
  leftFace: [0, 1, 2],
  rightFace: [3, 0, 1],
  solvedBase: 2,
};

describe('CubeRendererComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CubeRendererComponent>>;
  let stubCubeState: StubCubeStateService;
  let appearance: AppearanceService;

  beforeEach(async () => {
    stubCubeState = new StubCubeStateService();
    await TestBed.configureTestingModule({
      imports: [CubeRendererComponent],
      providers: [AppearanceService, { provide: CubeStateService, useValue: stubCubeState }],
    }).compileComponents();
    fixture = TestBed.createComponent(CubeRendererComponent);
    appearance = TestBed.inject(AppearanceService);
  });

  it('should be created', () => { expect(fixture.componentInstance).toBeTruthy(); });

  it('should render an SVG element', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
  });

  it('should not use a canvas element', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
  });

  it('should render exactly 27 polygon elements (9 top + 9 left + 9 right)', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('polygon').length).toBe(27);
  });

  it('should render exactly 9 top-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-face="top"]').length).toBe(9);
  });

  it('should render exactly 9 left-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-face="left"]').length).toBe(9);
  });

  it('should render exactly 9 right-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-face="right"]').length).toBe(9);
  });

  it('should fill all top-face polygons with topColor', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    for (const p of fixture.nativeElement.querySelectorAll('[data-face="top"]')) {
      expect(p.getAttribute('fill')).toBe(appearance.topColor);
    }
  });

  it('should fill left U-layer stickers from leftFace logical indices', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    for (let col = 0; col < 3; col++) {
      const p = fixture.nativeElement.querySelector(`[data-sticker="left-0-${col}"]`);
      expect(p.getAttribute('fill')).toBe(appearance.sideIndexToColor(KNOWN_STATE.leftFace[col]));
    }
  });

  it('should fill right U-layer stickers from rightFace logical indices (reversed col)', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    for (let col = 0; col < 3; col++) {
      const p = fixture.nativeElement.querySelector(`[data-sticker="right-0-${col}"]`);
      expect(p.getAttribute('fill')).toBe(appearance.sideIndexToColor(KNOWN_STATE.rightFace[2 - col]));
    }
  });

  it('should fill left solved rows with solvedBase color', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    const expected = appearance.sideIndexToColor(2);
    for (let row = 1; row <= 2; row++) {
      for (let col = 0; col < 3; col++) {
        const p = fixture.nativeElement.querySelector(`[data-sticker="left-${row}-${col}"]`);
        expect(p.getAttribute('fill')).toBe(expected);
      }
    }
  });

  it('should fill right solved rows with (solvedBase+1)%4 color', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    const expected = appearance.sideIndexToColor(3);
    for (let row = 1; row <= 2; row++) {
      for (let col = 0; col < 3; col++) {
        const p = fixture.nativeElement.querySelector(`[data-sticker="right-${row}-${col}"]`);
        expect(p.getAttribute('fill')).toBe(expected);
      }
    }
  });

  it('should update polygon fills when display state changes', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    const p = fixture.nativeElement.querySelector('[data-sticker="left-0-0"]');
    const before = p.getAttribute('fill');
    stubCubeState.setState({ leftFace: [3, 3, 3], rightFace: [0, 0, 0], solvedBase: 1 });
    fixture.detectChanges(); await fixture.whenStable();
    expect(p.getAttribute('fill')).not.toBe(before);
    expect(p.getAttribute('fill')).toBe(appearance.sideIndexToColor(3));
  });

  it('should hide the cube when display state is null', async () => {
    stubCubeState.setState(null); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('polygon').length).toBe(0);
  });

  it('should use data-sticker attributes for individual sticker identity', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-sticker="top-0-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="left-0-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="right-0-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="top-2-2"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="left-2-2"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="right-2-2"]')).not.toBeNull();
  });

  it('should fit cube polygons fully inside the svg frame', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();

    const svg = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    const viewBox = (svg.getAttribute('viewBox') ?? '').split(' ').map((value) => Number(value));
    const [minX, minY, width, height] = viewBox;
    const maxX = minX + width;
    const maxY = minY + height;

    const polygons = Array.from(fixture.nativeElement.querySelectorAll('polygon')) as SVGPolygonElement[];
    const allPoints = polygons.flatMap((polygon) => {
      const points = polygon.getAttribute('points') ?? '';
      return points
        .split(' ')
        .map((pair) => pair.split(','))
        .filter((pair) => pair.length === 2)
        .map(([x, y]) => ({ x: Number(x), y: Number(y) }));
    });

    const strokeHalf = 1;
    for (const point of allPoints) {
      expect(point.x).toBeGreaterThanOrEqual(minX + strokeHalf);
      expect(point.x).toBeLessThanOrEqual(maxX - strokeHalf);
      expect(point.y).toBeGreaterThanOrEqual(minY + strokeHalf);
      expect(point.y).toBeLessThanOrEqual(maxY - strokeHalf);
    }
  });

  it('should keep left outside and inside vertical edges straight', async () => {
    stubCubeState.setState(KNOWN_STATE); fixture.detectChanges(); await fixture.whenStable();

    const parsePoints = (polygon: SVGPolygonElement): Array<{ x: number; y: number }> =>
      (polygon.getAttribute('points') ?? '')
        .split(' ')
        .map((pair) => pair.split(','))
        .filter((pair) => pair.length === 2)
        .map(([x, y]) => ({ x: Number(x), y: Number(y) }));

    const isCollinear = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): boolean =>
      Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.5;

    const left00 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-0-0"]') as SVGPolygonElement);
    const left10 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-1-0"]') as SVGPolygonElement);
    const left20 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-2-0"]') as SVGPolygonElement);

    const left02 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-0-2"]') as SVGPolygonElement);
    const left12 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-1-2"]') as SVGPolygonElement);
    const left22 = parsePoints(fixture.nativeElement.querySelector('[data-sticker="left-2-2"]') as SVGPolygonElement);

    const outsideTop = left00[0];
    const outsideMid1 = left00[3];
    const outsideMid2 = left10[3];
    const outsideBottom = left20[3];

    const insideTop = left02[1];
    const insideMid1 = left02[2];
    const insideMid2 = left12[2];
    const insideBottom = left22[2];

    expect(isCollinear(outsideTop, outsideMid1, outsideBottom)).toBe(true);
    expect(isCollinear(outsideTop, outsideMid2, outsideBottom)).toBe(true);
    expect(isCollinear(insideTop, insideMid1, insideBottom)).toBe(true);
    expect(isCollinear(insideTop, insideMid2, insideBottom)).toBe(true);
  });
});
