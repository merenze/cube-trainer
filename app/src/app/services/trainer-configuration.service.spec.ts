import { createRecognitionGroupKey } from '../domain/recognition-group-key';
import {
  CANONICAL_RECOGNITION_GROUPS,
} from '../domain/recognition-groups';
import {
  TrainerConfigurationService,
} from './trainer-configuration.service';

describe('trainer configuration service', () => {
  let service: TrainerConfigurationService;

  beforeEach(() => {
    service = new TrainerConfigurationService();
  });

  it('should allow enabling a recognition group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;

    service.enableGroup(groupKey);

    expect(service.enabledGroupKeys()).toContain(groupKey);
  });

  it('should allow disabling a recognition group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;

    service.enableGroup(groupKey);
    service.disableGroup(groupKey);

    expect(service.enabledGroupKeys()).not.toContain(groupKey);
  });

  it('should pre-enable the seven single-candidate groups by default', () => {
    const singleCandidateGroups = CANONICAL_RECOGNITION_GROUPS.filter(
      (g) => g.candidates.length === 1,
    );

    expect(service.enabledGroupKeys().length).toBe(7);
    for (const group of singleCandidateGroups) {
      expect(service.enabledGroupKeys()).toContain(group.key);
    }
  });

  it('should enable all candidates in a group when the group activates', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    service.enableGroup(groupKey);

    const enabledCandidates = service.enabledCandidateKeys(groupKey);
    expect(enabledCandidates.length).toBe(group.candidates.length);
    expect(enabledCandidates).toEqual(group.candidates);
  });

  it('should allow disabling a candidate within an enabled group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidateToDisable = group.candidates[0];

    service.enableGroup(groupKey);
    service.disableCandidate(groupKey, candidateToDisable);

    const enabledCandidates = service.enabledCandidateKeys(groupKey);
    expect(enabledCandidates).not.toContain(candidateToDisable);
    expect(enabledCandidates.length).toBe(group.candidates.length - 1);
  });

  it('should re-enable a previously disabled candidate', () => {
    const group = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    const candidate = group.candidates[0];

    service.enableGroup(group.key);
    service.disableCandidate(group.key, candidate);
    service.enableCandidate(group.key, candidate);

    expect(service.enabledCandidateKeys(group.key)).toContain(candidate);
  });

  it('should enable the group when enabling a candidate on a disabled group', () => {
    const group = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    const candidate = group.candidates[0];

    service.enableCandidate(group.key, candidate);

    expect(service.enabledGroupKeys()).toContain(group.key);
    expect(service.enabledCandidateKeys(group.key)).toContain(candidate);
    expect(service.enabledCandidateKeys(group.key)).not.toContain(group.candidates[1]);
  });

  it('should deselect the group when its last candidate is disabled', () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    service.disableCandidate(group.key, group.candidates[0]);

    expect(service.enabledGroupKeys()).not.toContain(group.key);
  });

  it('should not deselect the group when a non-last candidate is disabled', () => {
    const group = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    service.enableGroup(group.key);
    service.disableCandidate(group.key, group.candidates[0]);

    expect(service.enabledGroupKeys()).toContain(group.key);
  });

  it('hasEligibleCandidates should be true when single-candidate groups are pre-enabled', () => {
    expect(service.hasEligibleCandidates()).toBe(true);
  });

  it('hasEligibleCandidates should be false when no candidates are enabled', () => {
    service.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    expect(service.hasEligibleCandidates()).toBe(false);
  });

  it('should return empty candidate list for a disabled group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!.key;

    expect(service.enabledCandidateKeys(groupKey).length).toBe(0);
  });

  it('should preserve per-group candidate state independently', () => {
    const group1Key = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group2Key = CANONICAL_RECOGNITION_GROUPS[1].key;
    const group1 = CANONICAL_RECOGNITION_GROUPS[0];

    service.enableGroup(group1Key);
    service.enableGroup(group2Key);
    service.disableCandidate(group1Key, group1.candidates[0]);

    expect(service.enabledCandidateKeys(group1Key).length).toBe(
      group1.candidates.length - 1,
    );
    expect(service.enabledCandidateKeys(group2Key).length).toBe(
      CANONICAL_RECOGNITION_GROUPS[1].candidates.length,
    );
  });

  it('should start with configurationVersion 0', () => {
    expect(service.configurationVersion()).toBe(0);
  });

  it('should increment configurationVersion when a group is enabled', () => {
    const key = CANONICAL_RECOGNITION_GROUPS[0].key;
    service.enableGroup(key);
    expect(service.configurationVersion()).toBeGreaterThan(0);
  });

  it('should increment configurationVersion when a group is disabled', () => {
    const key = CANONICAL_RECOGNITION_GROUPS[0].key;
    service.enableGroup(key);
    const v = service.configurationVersion();
    service.disableGroup(key);
    expect(service.configurationVersion()).toBeGreaterThan(v);
  });

  it('should increment configurationVersion when a candidate is disabled', () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    service.enableGroup(group.key);
    const v = service.configurationVersion();
    service.disableCandidate(group.key, group.candidates[0]);
    expect(service.configurationVersion()).toBeGreaterThan(v);
  });

  it('should increment configurationVersion when a candidate is re-enabled', () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    service.enableGroup(group.key);
    service.disableCandidate(group.key, group.candidates[0]);
    const v = service.configurationVersion();
    service.enableCandidate(group.key, group.candidates[0]);
    expect(service.configurationVersion()).toBeGreaterThan(v);
  });

  it('takeSnapshot should capture enabled groups and candidates', () => {
    const group0 = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    const group1 = CANONICAL_RECOGNITION_GROUPS[1];
    service.enableGroup(group0.key);
    service.enableGroup(group1.key);
    service.disableCandidate(group0.key, group0.candidates[0]);

    const snap = service.takeSnapshot();

    expect(snap.enabledGroups).toContain(group0.key);
    expect(snap.enabledGroups).toContain(group1.key);
    expect(snap.enabledCandidates.get(group0.key)).not.toContain(group0.candidates[0]);
    expect(snap.enabledCandidates.get(group0.key)?.length).toBe(group0.candidates.length - 1);
  });

  it('takeSnapshot of default config should have 7 enabled groups', () => {
    const snap = service.takeSnapshot();
    expect(snap.enabledGroups.length).toBe(7);
  });

  it('restoreSnapshot should restore enabled groups', () => {
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    service.enableGroup(group0.key);
    const snap = service.takeSnapshot();

    service.disableGroup(group0.key);
    expect(service.enabledGroupKeys()).not.toContain(group0.key);

    service.restoreSnapshot(snap);

    expect(service.enabledGroupKeys()).toContain(group0.key);
  });

  it('restoreSnapshot should restore per-group candidates', () => {
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    service.enableGroup(group0.key);
    service.disableCandidate(group0.key, group0.candidates[0]);
    const snap = service.takeSnapshot();

    service.enableCandidate(group0.key, group0.candidates[0]);
    service.restoreSnapshot(snap);

    expect(service.enabledCandidateKeys(group0.key)).not.toContain(group0.candidates[0]);
    expect(service.enabledCandidateKeys(group0.key).length).toBe(group0.candidates.length - 1);
  });

  it('restoreSnapshot to empty should leave no enabled groups', () => {
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    service.enableGroup(group0.key);
    const emptySnap = { enabledGroups: [] as const, enabledCandidates: new Map() };

    service.restoreSnapshot(emptySnap);

    expect(service.enabledGroupKeys().length).toBe(0);
  });

  it('restoreSnapshot should bump configurationVersion', () => {
    const snap = service.takeSnapshot();
    const v = service.configurationVersion();

    service.restoreSnapshot(snap);

    expect(service.configurationVersion()).toBeGreaterThan(v);
  });
});
