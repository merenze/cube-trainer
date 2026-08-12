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

  it('should return empty enabled groups by default', () => {
    expect(service.enabledGroupKeys().length).toBe(0);
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
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidate = group.candidates[0];

    service.enableGroup(groupKey);
    service.disableCandidate(groupKey, candidate);
    service.enableCandidate(groupKey, candidate);

    expect(service.enabledCandidateKeys(groupKey)).toContain(candidate);
  });

  it('should return empty candidate list for a disabled group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;

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
});
