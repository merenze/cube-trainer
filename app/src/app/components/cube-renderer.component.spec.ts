import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CubeRendererComponent } from './cube-renderer.component';
import { CubeStateService, type CubeDisplayState } from '../services/cube-state.service';
import { AppearanceService } from '../services/appearance.service';

class StubCubeStateService {
  private readonly _displayState = signal<CubeDisplayState | null>(null);
  readonly displayState = this._displayState.asReadonly();

  setState(state: CubeDisplayState | null): void {
    this._displayState.set(state);
  }
}

const KNOWN_STATE: CubeDisplayState = {
  leftFace: [0, 1, 2],
  rightFace: [3, 0, 1],
};

describe('CubeRendererComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<CubeRendererComponent>>;
  let stubCubeState: StubCubeStateService;
  let appearance: AppearanceService;

  beforeEach(async () => {
    stubCubeState = new StubCubeStateService();

    await TestBed.configureTestingModule({
      imports: [CubeRendererComponent],
      providers: [
        AppearanceService,
        { provide: CubeStateService, useValue: stubCubeState },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CubeRendererComponent);
    appearance = TestBed.inject(AppearanceService);
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an SVG element', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('should not use a canvas element', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeNull();
  });

  it('should render exactly 15 polygon elements (9 top + 3 left + 3 right)', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const polygons = fixture.nativeElement.querySelectorAll('polygon');
    expect(polygons.length).toBe(15);
  });

  it('should render exactly 9 top-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const topPolygons = fixture.nativeElement.querySelectorAll('[data-face="top"]');
    expect(topPolygons.length).toBe(9);
  });

  it('should render exactly 3 left-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const leftPolygons = fixture.nativeElement.querySelectorAll('[data-face="left"]');
    expect(leftPolygons.length).toBe(3);
  });

  it('should render exactly 3 right-face polygons', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const rightPolygons = fixture.nativeElement.querySelectorAll('[data-face="right"]');
    expect(rightPolygons.length).toBe(3);
  });

  it('should fill all top-face polygons with the top color', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const topPolygons = fixture.nativeElement.querySelectorAll('[data-face="top"]');
    for (const polygon of topPolygons) {
      expect(polygon.getAttribute('fill')).toBe(appearance.topColor);
    }
  });

  it('should fill left-face polygons from the leftFace logical indices', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const leftPolygons = fixture.nativeElement.querySelectorAll('[data-face="left"]');
    expect(leftPolygons[0].getAttribute('fill')).toBe(appearance.sideIndexToColor(0));
    expect(leftPolygons[1].getAttribute('fill')).toBe(appearance.sideIndexToColor(1));
    expect(leftPolygons[2].getAttribute('fill')).toBe(appearance.sideIndexToColor(2));
  });

  it('should fill right-face polygons from the rightFace logical indices', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const rightPolygons = fixture.nativeElement.querySelectorAll('[data-face="right"]');
    expect(rightPolygons[0].getAttribute('fill')).toBe(appearance.sideIndexToColor(3));
    expect(rightPolygons[1].getAttribute('fill')).toBe(appearance.sideIndexToColor(0));
    expect(rightPolygons[2].getAttribute('fill')).toBe(appearance.sideIndexToColor(1));
  });

  it('should update polygon fills when display state changes', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    const leftPolygons = fixture.nativeElement.querySelectorAll('[data-face="left"]');
    const initialFill = leftPolygons[0].getAttribute('fill');

    stubCubeState.setState({ leftFace: [3, 3, 3], rightFace: [0, 0, 0] });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(leftPolygons[0].getAttribute('fill')).toBe(appearance.sideIndexToColor(3));
    expect(leftPolygons[0].getAttribute('fill')).not.toBe(initialFill);
  });

  it('should hide the cube when display state is null', async () => {
    stubCubeState.setState(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const polygons = fixture.nativeElement.querySelectorAll('polygon');
    expect(polygons.length).toBe(0);
  });

  it('should use data-sticker attributes for individual sticker identity', async () => {
    stubCubeState.setState(KNOWN_STATE);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[data-sticker="top-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="left-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="right-0"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-sticker="top-8"]')).not.toBeNull();
  });
});
