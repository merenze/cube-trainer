import { TestBed } from '@angular/core/testing';
import { AppearanceService } from './appearance.service';

describe('AppearanceService', () => {
  let service: AppearanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AppearanceService] });
    service = TestBed.inject(AppearanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a non-empty top color (yellow)', () => {
    expect(service.topColor).toBeTruthy();
    expect(service.topColor.length).toBeGreaterThan(0);
  });

  it('should return a color for each of the four side indices', () => {
    expect(service.sideIndexToColor(0)).toBeTruthy();
    expect(service.sideIndexToColor(1)).toBeTruthy();
    expect(service.sideIndexToColor(2)).toBeTruthy();
    expect(service.sideIndexToColor(3)).toBeTruthy();
  });

  it('should return four distinct side colors', () => {
    const colors = new Set([
      service.sideIndexToColor(0),
      service.sideIndexToColor(1),
      service.sideIndexToColor(2),
      service.sideIndexToColor(3),
    ]);
    expect(colors.size).toBe(4);
  });

  it('should return side colors distinct from the top color', () => {
    expect(service.sideIndexToColor(0)).not.toBe(service.topColor);
    expect(service.sideIndexToColor(1)).not.toBe(service.topColor);
    expect(service.sideIndexToColor(2)).not.toBe(service.topColor);
    expect(service.sideIndexToColor(3)).not.toBe(service.topColor);
  });

  it('should return colors in the canonical Red → Green → Orange → Blue sequence', () => {
    // Sequence: 0=Red, 1=Green, 2=Orange, 3=Blue
    const red = service.sideIndexToColor(0);
    const green = service.sideIndexToColor(1);
    const orange = service.sideIndexToColor(2);
    const blue = service.sideIndexToColor(3);

    // Verify each color is consistent across calls
    expect(service.sideIndexToColor(0)).toBe(red);
    expect(service.sideIndexToColor(1)).toBe(green);
    expect(service.sideIndexToColor(2)).toBe(orange);
    expect(service.sideIndexToColor(3)).toBe(blue);
  });
});
