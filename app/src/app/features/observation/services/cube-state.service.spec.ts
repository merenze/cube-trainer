import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CubeStateService } from './cube-state.service';
import { TrainerLifecycleService } from '../../core';
import { type SideColorLayout } from '../../../domain';

class StubTrainerLifecycleService {
  private readonly _resolvedLayout = signal<SideColorLayout | null>(null);
  readonly resolvedLayout = this._resolvedLayout.asReadonly();

  setLayout(layout: SideColorLayout | null): void {
    this._resolvedLayout.set(layout);
  }

  // Unused by CubeStateService but satisfies DI type shape
  readonly state = signal('idle' as const).asReadonly();
  readonly activeObservation = signal(null).asReadonly();
  readonly answerFeedback = signal(null).asReadonly();
  readonly incorrectAttemptOccurred = signal(false).asReadonly();
}

describe('CubeStateService', () => {
  let service: CubeStateService;
  let stub: StubTrainerLifecycleService;

  beforeEach(() => {
    stub = new StubTrainerLifecycleService();

    TestBed.configureTestingModule({
      providers: [
        CubeStateService,
        { provide: TrainerLifecycleService, useValue: stub },
      ],
    });

    service = TestBed.inject(CubeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose null display state when no layout is resolved', () => {
    expect(service.displayState()).toBeNull();
  });

  it('should expose left and right face indices when a layout is resolved', () => {
    stub.setLayout({ left: [0, 1, 0] as const, right: [1, 2, 1] as const });

    const state = service.displayState();

    expect(state).not.toBeNull();
    expect(state!.leftFace).toEqual([0, 1, 0]);
    expect(state!.rightFace).toEqual([1, 2, 1]);
  });

  it('should return null when layout is reset to null', () => {
    stub.setLayout({ left: [0, 1, 0] as const, right: [1, 2, 1] as const });
    stub.setLayout(null);

    expect(service.displayState()).toBeNull();
  });

  it('should update display state reactively when layout changes', () => {
    stub.setLayout({ left: [0, 1, 0] as const, right: [1, 2, 1] as const });
    expect(service.displayState()?.leftFace[1]).toBe(1);

    stub.setLayout({ left: [0, 2, 0] as const, right: [1, 3, 1] as const });
    expect(service.displayState()?.leftFace[1]).toBe(2);
  });

  it('should produce a left face with exactly 3 indices', () => {
    stub.setLayout({ left: [0, 1, 2] as const, right: [3, 0, 1] as const });

    expect(service.displayState()!.leftFace.length).toBe(3);
  });

  it('should produce a right face with exactly 3 indices', () => {
    stub.setLayout({ left: [0, 1, 2] as const, right: [3, 0, 1] as const });

    expect(service.displayState()!.rightFace.length).toBe(3);
  });

  it('should include a solvedBase value in range 0-3', () => {
    stub.setLayout({ left: [0, 1, 2] as const, right: [3, 0, 1] as const });

    const base = service.displayState()!.solvedBase;
    expect([0, 1, 2, 3]).toContain(base);
  });
});
