import { TestBed } from '@angular/core/testing';
import { EligibleObservationService } from './eligible-observation.service';
import { TrainerConfigurationService } from './trainer-configuration.service';
import {
  CANONICAL_RECOGNITION_GROUPS,
} from '../domain/recognition-groups';
import {
  getObservationColorMappingsForTriplet,
  CANONICAL_OBSERVATION_COLOR_MAPPINGS,
} from '../domain/observation-color-catalog';

describe('EligibleObservationService', () => {
  let service: EligibleObservationService;
  let configService: TrainerConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EligibleObservationService, TrainerConfigurationService],
    });
    service = TestBed.inject(EligibleObservationService);
    configService = TestBed.inject(TrainerConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty observations when no groups are enabled', () => {
    const observations = service.eligibleObservations();
    expect(observations).toEqual([]);
  });

  it('should return observations for all candidates in an enabled group', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    configService.enableGroup(groupKey);

    const observations = service.eligibleObservations();

    // Should have one observation triplet per candidate
    expect(observations.length).toBe(group.candidates.length);

    // All observations should correspond to enabled candidates
    for (const obs of observations) {
      expect(group.candidates).toContain(obs.candidate);
    }
  });

  it('should exclude disabled candidates from eligible observations', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidateToDisable = group.candidates[0];

    configService.enableGroup(groupKey);
    configService.disableCandidate(groupKey, candidateToDisable);

    const observations = service.eligibleObservations();

    expect(observations.length).toBe(group.candidates.length - 1);
    expect(
      observations.every((obs) => obs.candidate !== candidateToDisable),
    ).toBe(true);
  });

  it('should include observations from multiple enabled groups', () => {
    const group1Key = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group2Key = CANONICAL_RECOGNITION_GROUPS[1].key;
    const group1 = CANONICAL_RECOGNITION_GROUPS[0];
    const group2 = CANONICAL_RECOGNITION_GROUPS[1];

    configService.enableGroup(group1Key);
    configService.enableGroup(group2Key);

    const observations = service.eligibleObservations();

    const expectedCount = group1.candidates.length + group2.candidates.length;
    expect(observations.length).toBe(expectedCount);
  });

  it('should return observation triplets for each candidate', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const candidate = CANONICAL_RECOGNITION_GROUPS[0].candidates[0];
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    configService.enableGroup(groupKey);

    const observations = service.eligibleObservations();
    const obsForCandidate = observations.find((o) => o.candidate === candidate);

    expect(obsForCandidate).toBeTruthy();
    // Should have color layout variants
    if (obsForCandidate) {
      expect(obsForCandidate.colorLayoutVariants.length).toBeGreaterThan(0);
      // Verify we can look up via the catalog
      const catalogMappings = getObservationColorMappingsForTriplet(
        candidate,
        group.leftPattern,
        group.rightPattern,
      );
      expect(catalogMappings.length).toBeGreaterThan(0);
    }
  });

  it('should return observations reflecting current configuration when config changes', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    configService.enableGroup(groupKey);
    let observations = service.eligibleObservations();
    const initialCount = observations.length;

    configService.disableCandidate(groupKey, group.candidates[0]);
    observations = service.eligibleObservations();

    expect(observations.length).toBe(initialCount - 1);
  });

  it('should have at least one observation when any group is enabled', () => {
    const groupKey = CANONICAL_RECOGNITION_GROUPS[0].key;

    configService.enableGroup(groupKey);

    const observations = service.eligibleObservations();
    expect(observations.length).toBeGreaterThan(0);
  });
});
