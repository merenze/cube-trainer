import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { App } from './app';
import { TrainerLifecycleService } from './services/trainer-lifecycle.service';
import { SessionStatisticsService } from './services/session-statistics.service';
import { CubeStateService } from './services/cube-state.service';
import { CASE_ORDERING_STRATEGY } from './services/case-ordering-strategy';
import { COLOR_ANCHOR_STRATEGY } from './services/color-anchor-strategy';
import { type CubeDisplayState } from './services/cube-state.service';
import type { TrainerLifecycleState, AnswerFeedback } from './services/trainer-lifecycle.service';

class StubTrainerLifecycleService {
  private readonly _state = signal<TrainerLifecycleState>('idle');
  private readonly _answerFeedback = signal<AnswerFeedback | null>(null);
  readonly state = this._state.asReadonly();
  readonly answerFeedback = this._answerFeedback.asReadonly();
  readonly activeObservation = signal(null).asReadonly();
  readonly resolvedLayout = signal(null).asReadonly();
  readonly incorrectAttemptOccurred = signal(false).asReadonly();
  advanceCalls = 0;

  setState(s: TrainerLifecycleState) { this._state.set(s); }
  setFeedback(f: AnswerFeedback | null) { this._answerFeedback.set(f); }
  advance = () => { this.advanceCalls++; };
  submitAnswer = (_: any) => {};
}

class StubSessionStatisticsService {
  readonly firstTryCorrectCount = signal(0).asReadonly();
  readonly totalRoundsCompleted = signal(0).asReadonly();
}

class StubCubeStateService {
  readonly displayState = signal<CubeDisplayState | null>(null).asReadonly();
}

const MINIMAL_PROVIDERS = [
  { provide: TrainerLifecycleService, useClass: StubTrainerLifecycleService },
  { provide: SessionStatisticsService, useClass: StubSessionStatisticsService },
  { provide: CubeStateService, useClass: StubCubeStateService },
  { provide: CASE_ORDERING_STRATEGY, useValue: { order: (o: any) => o } },
  { provide: COLOR_ANCHOR_STRATEGY, useValue: { selectLayout: (o: any) => o.colorLayoutVariants[0] } },
];

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: MINIMAL_PROVIDERS,
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the application title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PLL Recognition Trainer');
  });

  it('should include the cube renderer component', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-cube-renderer')).not.toBeNull();
  });

  it('should show empty-state message when lifecycle is idle', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Enable at least one recognition group');
  });

  it('should not show empty-state message when lifecycle is presenting', async () => {
    const fixture = TestBed.createComponent(App);
    const stub = TestBed.inject(TrainerLifecycleService) as unknown as StubTrainerLifecycleService;
    stub.setState('presenting');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Enable at least one recognition group');
  });

  it('should show correct feedback when answerFeedback is correct', async () => {
    const fixture = TestBed.createComponent(App);
    const stub = TestBed.inject(TrainerLifecycleService) as unknown as StubTrainerLifecycleService;
    stub.setState('presenting');
    stub.setFeedback('correct');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Correct');
  });

  it('should show incorrect feedback when answerFeedback is incorrect', async () => {
    const fixture = TestBed.createComponent(App);
    const stub = TestBed.inject(TrainerLifecycleService) as unknown as StubTrainerLifecycleService;
    stub.setState('presenting');
    stub.setFeedback('incorrect');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Incorrect');
  });

  it('should show statistics', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('First-try correct');
  });

  it('should show a start button when lifecycle is idle', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = (fixture.nativeElement as HTMLElement).querySelector('.start-btn');
    expect(btn).not.toBeNull();
  });

  it('should call lifecycle.advance when start button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const stub = TestBed.inject(TrainerLifecycleService) as unknown as StubTrainerLifecycleService;
    fixture.detectChanges();
    await fixture.whenStable();

    const btn: HTMLButtonElement = (fixture.nativeElement as HTMLElement).querySelector('.start-btn')!;
    btn.click();

    expect(stub.advanceCalls).toBe(1);
  });

  it('should hide start button when lifecycle is presenting', async () => {
    const fixture = TestBed.createComponent(App);
    const stub = TestBed.inject(TrainerLifecycleService) as unknown as StubTrainerLifecycleService;
    stub.setState('presenting');
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = (fixture.nativeElement as HTMLElement).querySelector('.start-btn');
    expect(btn).toBeNull();
  });
});
