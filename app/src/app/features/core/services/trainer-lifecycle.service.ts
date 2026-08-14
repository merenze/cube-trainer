import { Injectable, Inject, signal } from '@angular/core';
import { CaseSelectorService } from './case-selector.service';
import { COLOR_ANCHOR_STRATEGY, type ColorAnchorStrategy } from './color-anchor-strategy';
import { type EligibleObservation } from './eligible-observation.service';
import { type SideColorLayout, type PllPermutation } from '../domain';
import { SessionStatisticsService } from '../features/session-stats';

export type TrainerLifecycleState = 'idle' | 'presenting' | 'empty';
export type AnswerFeedback = 'correct' | 'incorrect';

@Injectable({
  providedIn: 'root',
})
export class TrainerLifecycleService {
  private readonly _state = signal<TrainerLifecycleState>('idle');
  private readonly _activeObservation = signal<EligibleObservation | null>(null);
  private readonly _resolvedLayout = signal<SideColorLayout | null>(null);
  private readonly _answerFeedback = signal<AnswerFeedback | null>(null);
  private readonly _incorrectAttemptOccurred = signal(false);

  readonly state = this._state.asReadonly();
  readonly activeObservation = this._activeObservation.asReadonly();
  readonly resolvedLayout = this._resolvedLayout.asReadonly();
  readonly answerFeedback = this._answerFeedback.asReadonly();
  readonly incorrectAttemptOccurred = this._incorrectAttemptOccurred.asReadonly();

  constructor(
    private caseSelectorService: CaseSelectorService,
    @Inject(COLOR_ANCHOR_STRATEGY) private colorAnchorStrategy: ColorAnchorStrategy,
    private statsService: SessionStatisticsService,
  ) {}

  advance(): void {
    const next = this.caseSelectorService.nextCase();
    if (next === null) {
      this._state.set('empty');
      this._activeObservation.set(null);
      this._resolvedLayout.set(null);
      this._answerFeedback.set(null);
      this._incorrectAttemptOccurred.set(false);
      return;
    }
    this._activeObservation.set(next);
    this._resolvedLayout.set(this.colorAnchorStrategy.selectLayout(next));
    this._answerFeedback.set(null);
    this._incorrectAttemptOccurred.set(false);
    this._state.set('presenting');
  }

  submitAnswer(candidate: PllPermutation): void {
    const active = this._activeObservation();
    if (!active) {
      return;
    }

    if (candidate === active.candidate) {
      const firstTry = !this._incorrectAttemptOccurred();
      this._answerFeedback.set('correct');
      this.statsService.recordRoundComplete(firstTry);
      // Do NOT auto-advance: feedback='correct' stays visible until advance() is called
    } else {
      this._incorrectAttemptOccurred.set(true);
      this._answerFeedback.set('incorrect');
    }
  }

  resetToIdle(): void {
    this._state.set('idle');
    this._activeObservation.set(null);
    this._resolvedLayout.set(null);
    this._answerFeedback.set(null);
    this._incorrectAttemptOccurred.set(false);
  }
}
