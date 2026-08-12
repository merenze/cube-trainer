import { Component, inject, computed } from '@angular/core';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { TrainerLifecycleService } from '../services/trainer-lifecycle.service';
import { CANONICAL_RECOGNITION_GROUPS } from '../domain/recognition-groups';
import { type PllPermutation } from '../domain/pll-catalog';

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
export class AnswerControlComponent {
  private configService = inject(TrainerConfigurationService);
  private lifecycleService = inject(TrainerLifecycleService);

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
    // If round already answered correctly, advance to next case instead of re-evaluating
    if (this.lifecycleService.answerFeedback() === 'correct') {
      this.lifecycleService.advance();
    } else {
      this.lifecycleService.submitAnswer(candidate);
    }
  }
}
