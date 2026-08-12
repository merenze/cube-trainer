import { Component, inject } from '@angular/core';
import { CANONICAL_RECOGNITION_GROUPS, type RecognitionGroup } from '../domain/recognition-groups';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { type RecognitionGroupKey } from '../domain/recognition-group-key';
import { type PllPermutation } from '../domain/pll-catalog';

@Component({
  selector: 'app-trainer-configuration',
  standalone: true,
  template: `
    <div class="group-chips">
      @for (group of groups; track group.key) {
        <button
          type="button"
          class="group-chip"
          data-group-chip
          [attr.data-group-key]="group.key"
          [attr.aria-pressed]="isGroupEnabled(group.key)"
          (click)="toggleGroup(group.key)">
          {{ group.leftPattern }} · {{ group.rightPattern }}
        </button>

        @if (isGroupEnabled(group.key)) {
          <span class="candidate-chips">
            @for (candidate of group.candidates; track candidate) {
              <button
                type="button"
                class="candidate-chip"
                data-candidate-chip
                [attr.data-candidate]="candidate"
                [attr.aria-pressed]="isCandidateEnabled(group.key, candidate)"
                (click)="toggleCandidate(group.key, candidate)">
                {{ candidate }}
              </button>
            }
          </span>
        }
      }
    </div>
  `,
})
export class TrainerConfigurationComponent {
  private configService = inject(TrainerConfigurationService);

  protected readonly groups: readonly RecognitionGroup[] = CANONICAL_RECOGNITION_GROUPS;

  protected isGroupEnabled(key: RecognitionGroupKey): boolean {
    return this.configService.enabledGroupKeys().includes(key);
  }

  protected isCandidateEnabled(groupKey: RecognitionGroupKey, candidate: PllPermutation): boolean {
    return this.configService.enabledCandidateKeys(groupKey).includes(candidate);
  }

  protected toggleGroup(key: RecognitionGroupKey): void {
    if (this.isGroupEnabled(key)) {
      this.configService.disableGroup(key);
    } else {
      this.configService.enableGroup(key);
    }
  }

  protected toggleCandidate(groupKey: RecognitionGroupKey, candidate: PllPermutation): void {
    if (this.isCandidateEnabled(groupKey, candidate)) {
      this.configService.disableCandidate(groupKey, candidate);
    } else {
      this.configService.enableCandidate(groupKey, candidate);
    }
  }
}
