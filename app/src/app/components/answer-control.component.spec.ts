import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AnswerControlComponent } from './answer-control.component';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { TrainerLifecycleService } from '../services/trainer-lifecycle.service';
import { CANONICAL_RECOGNITION_GROUPS } from '../domain/recognition-groups';
import type { TrainerLifecycleState } from '../services/trainer-lifecycle.service';

class StubTrainerLifecycleService {
  private readonly _state = signal<TrainerLifecycleState>('presenting');
  private readonly _answerFeedback = signal<any>(null);
  readonly state = this._state.asReadonly();
  readonly answerFeedback = this._answerFeedback.asReadonly();
  readonly activeObservation = signal(null).asReadonly();
  readonly resolvedLayout = signal(null).asReadonly();
  readonly incorrectAttemptOccurred = signal(false).asReadonly();
  submittedAnswers: string[] = [];
  advanceCalls = 0;

  setState(s: TrainerLifecycleState) { this._state.set(s); }
  setFeedback(f: any) { this._answerFeedback.set(f); }
  advance = () => { this.advanceCalls++; };
  submitAnswer = (candidate: string) => { this.submittedAnswers.push(candidate); };
}

describe('AnswerControlComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<AnswerControlComponent>>;
  let configService: TrainerConfigurationService;
  let stubLifecycle: StubTrainerLifecycleService;

  beforeEach(async () => {
    stubLifecycle = new StubTrainerLifecycleService();

    await TestBed.configureTestingModule({
      imports: [AnswerControlComponent],
      providers: [
        TrainerConfigurationService,
        { provide: TrainerLifecycleService, useValue: stubLifecycle },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerControlComponent);
    configService = TestBed.inject(TrainerConfigurationService);
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show no answer chips when no groups are enabled', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.nativeElement.querySelectorAll('[data-answer-chip]');
    expect(chips.length).toBe(0);
  });

  it('should show answer chips for the candidates in an enabled group', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.nativeElement.querySelectorAll('[data-answer-chip]');
    expect(chips.length).toBe(group.candidates.length);
  });

  it('should show the PLL name on each answer chip', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    for (const candidate of group.candidates) {
      const chip = fixture.nativeElement.querySelector(`[data-answer="${candidate}"]`);
      expect(chip).not.toBeNull();
      expect(chip.textContent.trim()).toBe(candidate);
    }
  });

  it('should deduplicate candidates that appear in multiple enabled groups', async () => {
    // Find two groups that share a candidate (Gc appears in None|Bar inside and Headlights|None)
    const gcGroups = CANONICAL_RECOGNITION_GROUPS.filter((g) => g.candidates.includes('Gc'));
    if (gcGroups.length < 2) {
      return; // skip if data doesn't contain the expected overlap
    }
    configService.enableGroup(gcGroups[0].key);
    configService.enableGroup(gcGroups[1].key);
    fixture.detectChanges();
    await fixture.whenStable();

    const gcChips = fixture.nativeElement.querySelectorAll('[data-answer="Gc"]');
    expect(gcChips.length).toBe(1);
  });

  it('should call lifecycle.submitAnswer with the PLL when a chip is clicked', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidate = group.candidates[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-answer="${candidate}"]`);
    chip.click();

    expect(stubLifecycle.submittedAnswers).toContain(candidate);
  });

  it('should call lifecycle.advance when a chip is clicked after a correct answer', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidate = group.candidates[0];
    configService.enableGroup(group.key);
    stubLifecycle.setFeedback('correct');
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-answer="${candidate}"]`);
    chip.click();

    expect(stubLifecycle.advanceCalls).toBe(1);
    expect(stubLifecycle.submittedAnswers.length).toBe(0);
  });

  it('should hide answer chips when lifecycle state is idle', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    stubLifecycle.setState('idle');
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.nativeElement.querySelectorAll('[data-answer-chip]');
    expect(chips.length).toBe(0);
  });

  it('should hide answer chips when lifecycle state is empty', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    stubLifecycle.setState('empty');
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.nativeElement.querySelectorAll('[data-answer-chip]');
    expect(chips.length).toBe(0);
  });
});
