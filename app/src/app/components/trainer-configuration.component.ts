import { Component, inject } from '@angular/core';
import { CANONICAL_RECOGNITION_GROUPS, type RecognitionGroup } from '../domain/recognition-groups';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { type RecognitionGroupKey } from '../domain/recognition-group-key';

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
          [attr.aria-pressed]="isEnabled(group.key)"
          (click)="toggleGroup(group.key)">
          {{ group.leftPattern }} · {{ group.rightPattern }}
        </button>
      }
    </div>
  `,
})
export class TrainerConfigurationComponent {
  private configService = inject(TrainerConfigurationService);

  protected readonly groups: readonly RecognitionGroup[] = CANONICAL_RECOGNITION_GROUPS;

  protected isEnabled(key: RecognitionGroupKey): boolean {
    return this.configService.enabledGroupKeys().includes(key);
  }

  protected toggleGroup(key: RecognitionGroupKey): void {
    if (this.isEnabled(key)) {
      this.configService.disableGroup(key);
    } else {
      this.configService.enableGroup(key);
    }
  }
}
