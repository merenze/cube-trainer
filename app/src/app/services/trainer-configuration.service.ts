import { Injectable, signal } from '@angular/core';
import {
  CANONICAL_RECOGNITION_GROUPS,
} from '../domain/recognition-groups';
import { type RecognitionGroupKey } from '../domain/recognition-group-key';
import { type PllPermutation } from '../domain/pll-catalog';

@Injectable({
  providedIn: 'root',
})
export class TrainerConfigurationService {
  private readonly enabledGroups = new Set<RecognitionGroupKey>();
  private readonly enabledCandidatesByGroup = new Map<
    RecognitionGroupKey,
    Set<PllPermutation>
  >();

  private readonly _configurationVersion = signal(0);
  readonly configurationVersion = this._configurationVersion.asReadonly();

  private bumpVersion(): void {
    this._configurationVersion.update((v) => v + 1);
  }

  private getGroupByKey(key: RecognitionGroupKey) {
    return CANONICAL_RECOGNITION_GROUPS.find((g) => g.key === key);
  }

  enableGroup(key: RecognitionGroupKey): void {
    const group = this.getGroupByKey(key);
    if (!group) {
      return;
    }

    this.enabledGroups.add(key);

    if (!this.enabledCandidatesByGroup.has(key)) {
      this.enabledCandidatesByGroup.set(
        key,
        new Set(group.candidates),
      );
    }
    this.bumpVersion();
  }

  disableGroup(key: RecognitionGroupKey): void {
    this.enabledGroups.delete(key);
    this.bumpVersion();
  }

  enabledGroupKeys(): readonly RecognitionGroupKey[] {
    return Array.from(this.enabledGroups);
  }

  enabledCandidateKeys(groupKey: RecognitionGroupKey): readonly PllPermutation[] {
    if (!this.enabledGroups.has(groupKey)) {
      return [];
    }

    const candidates = this.enabledCandidatesByGroup.get(groupKey);
    return candidates ? Array.from(candidates) : [];
  }

  disableCandidate(groupKey: RecognitionGroupKey, candidate: PllPermutation): void {
    const candidates = this.enabledCandidatesByGroup.get(groupKey);
    if (candidates) {
      candidates.delete(candidate);
      this.bumpVersion();
    }
  }

  enableCandidate(groupKey: RecognitionGroupKey, candidate: PllPermutation): void {
    let candidates = this.enabledCandidatesByGroup.get(groupKey);
    if (!candidates) {
      const group = this.getGroupByKey(groupKey);
      if (!group) {
        return;
      }
      candidates = new Set(group.candidates);
      this.enabledCandidatesByGroup.set(groupKey, candidates);
    }
    candidates.add(candidate);
    this.bumpVersion();
  }
}
