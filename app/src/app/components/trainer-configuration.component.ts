import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CANONICAL_RECOGNITION_GROUPS, type RecognitionGroup } from '../domain/recognition-groups';
import { FACE_PATTERNS, type FacePattern, type PllPermutation } from '../domain/pll-catalog';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { type RecognitionGroupKey } from '../domain/recognition-group-key';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

type PatternFilter = FacePattern | 'Any';

@Component({
  selector: 'app-trainer-configuration',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .config-container {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      width: 100%;
      overflow: hidden;
    }

    .config-header {
      padding: 16px 16px 8px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .config-header h2 {
      margin: 0 0 4px;
      font: var(--mat-sys-title-large);
    }

    .config-description {
      margin: 0;
      color: inherit;
      font: var(--mat-sys-body-medium);
    }

    .config-controls {
      padding: 8px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bulk-actions {
      display: flex;
      gap: 4px;
    }

    .config-filters {
      display: flex;
      gap: 12px;
    }

    .config-filters mat-form-field {
      flex: 1;
    }

    .group-list-header {
      display: grid;
      grid-template-columns: 40px 1fr 1fr auto;
      padding: 4px 16px 4px 8px;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .group-list {
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .group-row {
      display: grid;
      grid-template-columns: 40px 1fr 1fr auto;
      align-items: center;
      padding: 4px 8px 4px 8px;
      min-height: 48px;
    }

    .group-left,
    .group-right {
      font: var(--mat-sys-body-medium);
      padding: 0 8px;
    }

    .group-cases {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .case-count {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      min-width: 32px;
      text-align: right;
    }

    .group-expanded {
      background: var(--mat-sys-surface-container-low);
      padding: 8px 8px 8px 48px;
    }

    .candidate-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 6px;
    }

    .candidate-chip {
      padding: 4px 12px;
      border-radius: 20px;
      border: 1.5px solid var(--mat-sys-outline);
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-label-large);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }

    .candidate-chip[aria-pressed="true"] {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-color: var(--mat-sys-primary);
    }

    .config-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 8px 8px 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      flex-shrink: 0;
    }

    .config-summary {
      flex: 1;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `],
  template: `
    <div class="config-container">
      <div class="config-header">
        <h2>Configure training</h2>
        <p class="config-description">Select observation groups and optionally narrow their PLL cases.</p>
      </div>

      <div class="config-controls">
        <div class="bulk-actions">
          <button mat-button (click)="selectAll()">Select all</button>
          <button mat-button (click)="clearAll()">Clear</button>
        </div>
        <div class="config-filters">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Left pattern</mat-label>
            <mat-select [value]="leftFilter()" (selectionChange)="leftFilter.set($event.value)" data-left-filter>
              <mat-option value="Any">Any</mat-option>
              @for (p of facePatterns; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Right pattern</mat-label>
            <mat-select [value]="rightFilter()" (selectionChange)="rightFilter.set($event.value)" data-right-filter>
              <mat-option value="Any">Any</mat-option>
              @for (p of facePatterns; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="group-list-header" aria-hidden="true">
        <span></span>
        <span>Left</span>
        <span>Right</span>
        <span></span>
      </div>
      <mat-divider />

      <div class="group-list" role="list">
        @for (group of filteredGroups(); track group.key) {
          <div class="group-row" role="listitem"
               [attr.data-group-row]="group.key"
               [attr.data-group-key]="group.key">
            <mat-checkbox
              [checked]="isGroupEnabled(group.key)"
              (change)="onGroupCheckboxChange(group.key, $event.checked)"
              [attr.aria-label]="'Select group: ' + group.leftPattern + ' left, ' + group.rightPattern + ' right'"
              data-group-checkbox>
            </mat-checkbox>
            <span class="group-left">{{ group.leftPattern }}</span>
            <span class="group-right">{{ group.rightPattern }}</span>
            <span class="group-cases">
              @if (group.candidates.length === 1) {
                <button type="button"
                        class="candidate-chip"
                        data-candidate-chip
                        [attr.data-candidate]="group.candidates[0]"
                        [attr.aria-pressed]="isGroupEnabled(group.key)"
                        (click)="toggleCandidate(group.key, group.candidates[0])">
                  {{ group.candidates[0] }}
                </button>
              } @else {
                <span class="case-count" [attr.data-case-count]="group.key">
                  {{ enabledCandidateCount(group.key) }}/{{ group.candidates.length }}
                </span>
                <button mat-icon-button
                        (click)="toggleExpand(group.key)"
                        [attr.aria-expanded]="isGroupExpanded(group.key)"
                        [attr.aria-label]="(isGroupExpanded(group.key) ? 'Collapse' : 'Expand') + ': ' + group.leftPattern + ' \xb7 ' + group.rightPattern"
                        [attr.data-expand-btn]="group.key">
                  <mat-icon>{{ isGroupExpanded(group.key) ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
              }
            </span>
          </div>

          @if (group.candidates.length > 1 && isGroupExpanded(group.key)) {
            <div class="group-expanded" [attr.data-expanded-group]="group.key">
              <div class="candidate-chips">
                @for (candidate of group.candidates; track candidate) {
                  <button type="button"
                          class="candidate-chip"
                          data-candidate-chip
                          [attr.data-candidate]="candidate"
                          [attr.aria-pressed]="isCandidateEnabled(group.key, candidate)"
                          (click)="toggleCandidate(group.key, candidate)">
                    {{ candidate }}
                  </button>
                }
              </div>
            </div>
          }

          <mat-divider />
        }
      </div>

      <footer class="config-footer">
        <span class="config-summary" data-summary>{{ summaryText() }}</span>
        <button mat-button class="cancel-btn" (click)="cancelled.emit()">Cancel</button>
        <button mat-flat-button class="done-btn"
                [disabled]="!hasEligibleCandidates()"
                (click)="applied.emit()">Done</button>
      </footer>
    </div>
  `,
})
export class TrainerConfigurationComponent {
  private configService = inject(TrainerConfigurationService);

  @Output() cancelled = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();

  protected readonly groups: readonly RecognitionGroup[] = CANONICAL_RECOGNITION_GROUPS;
  protected readonly facePatterns = FACE_PATTERNS;

  protected readonly leftFilter = signal<PatternFilter>('Any');
  protected readonly rightFilter = signal<PatternFilter>('Any');
  protected readonly expandedGroups = signal<ReadonlySet<RecognitionGroupKey>>(new Set());

  protected readonly filteredGroups = computed(() => {
    const left = this.leftFilter();
    const right = this.rightFilter();
    return this.groups.filter(
      (g) =>
        (left === 'Any' || g.leftPattern === left) &&
        (right === 'Any' || g.rightPattern === right),
    );
  });

  protected readonly summaryText = computed(() => {
    this.configService.configurationVersion();
    const enabledKeys = this.configService.enabledGroupKeys();
    const groupCount = enabledKeys.length;
    const caseCount = enabledKeys.reduce(
      (sum, key) => sum + this.configService.enabledCandidateKeys(key).length,
      0,
    );
    return `${groupCount} group${groupCount !== 1 ? 's' : ''} \xb7 ${caseCount} case${caseCount !== 1 ? 's' : ''} selected`;
  });

  protected readonly hasEligibleCandidates = this.configService.hasEligibleCandidates;

  protected isGroupEnabled(key: RecognitionGroupKey): boolean {
    return this.configService.enabledGroupKeys().includes(key);
  }

  protected isCandidateEnabled(groupKey: RecognitionGroupKey, candidate: PllPermutation): boolean {
    return this.configService.enabledCandidateKeys(groupKey).includes(candidate);
  }

  protected enabledCandidateCount(groupKey: RecognitionGroupKey): number {
    return this.configService.enabledCandidateKeys(groupKey).length;
  }

  protected isGroupExpanded(key: RecognitionGroupKey): boolean {
    return this.expandedGroups().has(key);
  }

  protected toggleExpand(key: RecognitionGroupKey): void {
    const current = this.expandedGroups();
    const next = new Set(current);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.expandedGroups.set(next);
  }

  protected onGroupCheckboxChange(key: RecognitionGroupKey, checked: boolean): void {
    if (checked) {
      this.configService.enableGroup(key);
    } else {
      this.configService.disableGroup(key);
    }
  }

  protected toggleCandidate(groupKey: RecognitionGroupKey, candidate: PllPermutation): void {
    if (this.isCandidateEnabled(groupKey, candidate)) {
      this.configService.disableCandidate(groupKey, candidate);
    } else {
      this.configService.enableCandidate(groupKey, candidate);
    }
  }

  protected selectAll(): void {
    for (const group of this.filteredGroups()) {
      this.configService.enableGroup(group.key);
    }
  }

  protected clearAll(): void {
    for (const group of this.filteredGroups()) {
      this.configService.disableGroup(group.key);
    }
  }
}
