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
});
