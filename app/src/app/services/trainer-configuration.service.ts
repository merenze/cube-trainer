import { Injectable, computed, signal } from '@angular/core';
import {
  CANONICAL_RECOGNITION_GROUPS,
} from '../domain/recognition-groups';
import { type RecognitionGroupKey } from '../domain/recognition-group-key';
import { type PllPermutation } from '../domain/pll-catalog';

export type ConfigSnapshot = {
  enabledGroups: readonly RecognitionGroupKey[];
  enabledCandidates: ReadonlyMap<RecognitionGroupKey, readonly PllPermutation[]>;
};

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
  readonly hasEligibleCandidates = computed(() => {
    this._configurationVersion();
    return Array.from(this.enabledGroups).some(
      (key) => (this.enabledCandidatesByGroup.get(key)?.size ?? 0) > 0,
    );
  });

  constructor() {
    for (const group of CANONICAL_RECOGNITION_GROUPS) {
      if (group.candidates.length === 1) {
        this.enabledGroups.add(group.key);
        this.enabledCandidatesByGroup.set(group.key, new Set(group.candidates));
      }
    }
  }

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
      if (candidates.size === 0) {
        this.enabledGroups.delete(groupKey);
      }
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

  takeSnapshot(): ConfigSnapshot {
    const enabledGroups = Array.from(this.enabledGroups);
    const enabledCandidates = new Map<RecognitionGroupKey, readonly PllPermutation[]>();
    for (const key of enabledGroups) {
      const candidates = this.enabledCandidatesByGroup.get(key);
      enabledCandidates.set(key, candidates ? Array.from(candidates) : []);
    }
    return { enabledGroups, enabledCandidates };
  }

  restoreSnapshot(snapshot: ConfigSnapshot): void {
    this.enabledGroups.clear();
    this.enabledCandidatesByGroup.clear();
    for (const key of snapshot.enabledGroups) {
      this.enabledGroups.add(key);
      const candidates = snapshot.enabledCandidates.get(key);
      if (candidates) {
        this.enabledCandidatesByGroup.set(key, new Set(candidates));
      }
    }
    this.bumpVersion();
  }
}
