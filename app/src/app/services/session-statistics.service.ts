import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStatisticsService {
  private readonly _firstTryCorrectCount = signal(0);
  private readonly _totalRoundsCompleted = signal(0);

  readonly firstTryCorrectCount = this._firstTryCorrectCount.asReadonly();
  readonly totalRoundsCompleted = this._totalRoundsCompleted.asReadonly();

  recordRoundComplete(firstTryCorrect: boolean): void {
    this._totalRoundsCompleted.update((n) => n + 1);
    if (firstTryCorrect) {
      this._firstTryCorrectCount.update((n) => n + 1);
    }
  }

  reset(): void {
    this._firstTryCorrectCount.set(0);
    this._totalRoundsCompleted.set(0);
  }
}
