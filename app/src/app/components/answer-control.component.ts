import { Component, inject, computed, effect, OnDestroy } from '@angular/core';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { TrainerLifecycleService } from '../services/trainer-lifecycle.service';
import { CANONICAL_RECOGNITION_GROUPS, type PllPermutation } from '../domain';

const AUTO_ADVANCE_DELAY_MS = 900;

@Component({
  selector: 'app-answer-control',
  standalone: true,
  template: `
    @if (isPresenting()) {
      <div class="answer-chips">
        @for (candidate of answerSet(); track candidate) {
          <button
            type="button"
            class="answer-chip"
            data-answer-chip
            [attr.data-answer]="candidate"
            (click)="onChipClick(candidate)">
            {{ candidate }}
          </button>
        }
      </div>
    }
  `,
})
export class AnswerControlComponent implements OnDestroy {
  private configService = inject(TrainerConfigurationService);
  private lifecycleService = inject(TrainerLifecycleService);
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Auto-advance to next case after a brief pause when correct feedback appears
    effect(() => {
      const feedback = this.lifecycleService.answerFeedback();
      if (this.autoAdvanceTimer !== null) {
        clearTimeout(this.autoAdvanceTimer);
        this.autoAdvanceTimer = null;
      }
      if (feedback === 'correct') {
        this.autoAdvanceTimer = setTimeout(() => {
          this.autoAdvanceTimer = null;
          this.lifecycleService.advance();
        }, AUTO_ADVANCE_DELAY_MS);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceTimer !== null) {
      clearTimeout(this.autoAdvanceTimer);
    }
  }

  protected readonly isPresenting = computed(
    () => this.lifecycleService.state() === 'presenting',
  );

  protected readonly answerSet = computed<readonly PllPermutation[]>(() => {
    const seen = new Set<PllPermutation>();
    for (const group of CANONICAL_RECOGNITION_GROUPS) {
      if (this.configService.enabledGroupKeys().includes(group.key)) {
        for (const candidate of this.configService.enabledCandidateKeys(group.key)) {
          seen.add(candidate);
        }
      }
    }
    return Array.from(seen);
  });

  protected onChipClick(candidate: PllPermutation): void {
    if (this.lifecycleService.answerFeedback() === 'correct') {
      // Chip click during feedback window cancels the timer and advances immediately
      if (this.autoAdvanceTimer !== null) {
        clearTimeout(this.autoAdvanceTimer);
        this.autoAdvanceTimer = null;
      }
      this.lifecycleService.advance();
    } else {
      this.lifecycleService.submitAnswer(candidate);
    }
  }
}
