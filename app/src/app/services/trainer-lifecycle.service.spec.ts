import { TestBed } from '@angular/core/testing';
import { TrainerLifecycleService } from './trainer-lifecycle.service';
import { CaseSelectorService } from './case-selector.service';
import { COLOR_ANCHOR_STRATEGY, type ColorAnchorStrategy } from './color-anchor-strategy';
import { SessionStatisticsService } from './session-statistics.service';
import { type EligibleObservation } from './eligible-observation.service';
import { type SideColorLayout } from '../domain/observation-color-layout';

function makeObs(candidate: string): EligibleObservation {
  return {
    candidate: candidate as any,
    triplet: [candidate as any, 'Headlights', 'Headlights'],
    colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
  };
}

const FIXED_LAYOUT: SideColorLayout = { left: [0, 2, 0], right: [1, 3, 1] };

class FixedColorAnchorStrategy implements ColorAnchorStrategy {
  selectLayout(_obs: EligibleObservation): SideColorLayout {
    return FIXED_LAYOUT;
  }
}

class StubSessionStatisticsService {
  rounds: { firstTryCorrect: boolean }[] = [];

  recordRoundComplete(firstTryCorrect: boolean): void {
    this.rounds.push({ firstTryCorrect });
  }

  reset(): void {
    this.rounds = [];
  }
}

class StubCaseSelectorService {
  private queue: (EligibleObservation | null)[] = [];

  setQueue(...items: (EligibleObservation | null)[]): void {
    this.queue = [...items];
  }

  nextCase(): EligibleObservation | null {
    return this.queue.shift() ?? null;
  }
}

describe('TrainerLifecycleService', () => {
  let service: TrainerLifecycleService;
  let stubCaseSelector: StubCaseSelectorService;
  let stubStats: StubSessionStatisticsService;

  beforeEach(() => {
    stubCaseSelector = new StubCaseSelectorService();
    stubStats = new StubSessionStatisticsService();

    TestBed.configureTestingModule({
      providers: [
        TrainerLifecycleService,
        { provide: CaseSelectorService, useValue: stubCaseSelector },
        { provide: COLOR_ANCHOR_STRATEGY, useClass: FixedColorAnchorStrategy },
        { provide: SessionStatisticsService, useValue: stubStats },
      ],
    });

    service = TestBed.inject(TrainerLifecycleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start in idle state with no active observation', () => {
    expect(service.state()).toBe('idle');
    expect(service.activeObservation()).toBeNull();
    expect(service.resolvedLayout()).toBeNull();
    expect(service.answerFeedback()).toBeNull();
    expect(service.incorrectAttemptOccurred()).toBe(false);
  });

  it('should transition to presenting state when advance() loads a case', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));

    service.advance();

    expect(service.state()).toBe('presenting');
    expect(service.activeObservation()?.candidate).toBe('Ua');
  });

  it('should resolve the layout via color anchor strategy when advancing', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));

    service.advance();

    expect(service.resolvedLayout()).toEqual(FIXED_LAYOUT);
  });

  it('should transition to empty state when no cases are available', () => {
    stubCaseSelector.setQueue(null);

    service.advance();

    expect(service.state()).toBe('empty');
    expect(service.activeObservation()).toBeNull();
    expect(service.resolvedLayout()).toBeNull();
  });

  it('should reset round state when advancing to a new case', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), makeObs('Ub'));
    service.advance();
    service.submitAnswer('Z' as any); // incorrect

    service.advance();

    expect(service.answerFeedback()).toBeNull();
    expect(service.incorrectAttemptOccurred()).toBe(false);
  });

  it('should record incorrect attempt on wrong answer', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();

    service.submitAnswer('Ub' as any);

    expect(service.answerFeedback()).toBe('incorrect');
    expect(service.incorrectAttemptOccurred()).toBe(true);
    expect(service.activeObservation()?.candidate).toBe('Ua');
  });

  it('should remain on same case after incorrect answer', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();

    service.submitAnswer('Ub' as any);

    expect(service.state()).toBe('presenting');
    expect(service.activeObservation()?.candidate).toBe('Ua');
  });

  it('should set correct feedback but stay on same case after correct answer', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), makeObs('Ub'));
    service.advance();

    service.submitAnswer('Ua' as any);

    expect(service.answerFeedback()).toBe('correct');
    expect(service.activeObservation()?.candidate).toBe('Ua');
    expect(service.state()).toBe('presenting');
  });

  it('should advance to next case when advance() is called after correct answer', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), makeObs('Ub'));
    service.advance();
    service.submitAnswer('Ua' as any);

    service.advance();

    expect(service.activeObservation()?.candidate).toBe('Ub');
  });

  it('should preserve incorrectAttemptOccurred across multiple wrong guesses in a round', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();

    service.submitAnswer('Ub' as any);
    service.submitAnswer('Z' as any);

    expect(service.incorrectAttemptOccurred()).toBe(true);
    expect(service.activeObservation()?.candidate).toBe('Ua');
  });

  it('should remain in presenting state after correct answer until advance() is called', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), null);
    service.advance();

    service.submitAnswer('Ua' as any);

    expect(service.state()).toBe('presenting');

    service.advance();

    expect(service.state()).toBe('empty');
  });

  it('should do nothing when submitAnswer is called with no active observation', () => {
    expect(() => service.submitAnswer('Ua' as any)).not.toThrow();
    expect(service.state()).toBe('idle');
  });

  it('should record first-try-correct when correct on first attempt', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), makeObs('Ub'));
    service.advance();

    service.submitAnswer('Ua' as any);

    expect(stubStats.rounds).toEqual([{ firstTryCorrect: true }]);
  });

  it('should record not-first-try when correct after an incorrect attempt', () => {
    stubCaseSelector.setQueue(makeObs('Ua'), makeObs('Ub'));
    service.advance();
    service.submitAnswer('Ub' as any); // wrong

    service.submitAnswer('Ua' as any); // correct

    expect(stubStats.rounds).toEqual([{ firstTryCorrect: false }]);
  });

  it('should not record stats on incorrect answer', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();

    service.submitAnswer('Ub' as any);

    expect(stubStats.rounds.length).toBe(0);
  });

  it('should reset to idle state when resetToIdle() is called', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();

    service.resetToIdle();

    expect(service.state()).toBe('idle');
  });

  it('should clear all signals when resetToIdle() is called', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();
    service.submitAnswer('Ub' as any); // incorrect → sets feedback and incorrectAttemptOccurred

    service.resetToIdle();

    expect(service.activeObservation()).toBeNull();
    expect(service.resolvedLayout()).toBeNull();
    expect(service.answerFeedback()).toBeNull();
    expect(service.incorrectAttemptOccurred()).toBe(false);
  });

  it('should not record stats when resetToIdle() is called', () => {
    stubCaseSelector.setQueue(makeObs('Ua'));
    service.advance();
    const roundsBefore = stubStats.rounds.length;

    service.resetToIdle();

    expect(stubStats.rounds.length).toBe(roundsBefore);
  });
});
