import { TestBed } from '@angular/core/testing';
import { CaseSelectorService } from './case-selector.service';
import { EligibleObservationService, type EligibleObservation } from './eligible-observation.service';
import { CASE_ORDERING_STRATEGY, type CaseOrderingStrategy } from './case-ordering-strategy';
import { TrainerConfigurationService } from './trainer-configuration.service';
import { CANONICAL_RECOGNITION_GROUPS } from '../domain';

function makeObs(candidate: string): EligibleObservation {
  return {
    candidate: candidate as any,
    triplet: [candidate as any, 'Headlights', 'Headlights'],
    colorLayoutVariants: [{ left: [0, 1, 0] as const, right: [1, 2, 1] as const }],
  };
}

class IdentityOrderingStrategy implements CaseOrderingStrategy {
  order(obs: readonly EligibleObservation[]): readonly EligibleObservation[] {
    return Object.freeze([...obs]);
  }
}

class StubEligibleObservationService {
  private returnValues: EligibleObservation[][] = [];
  private callCount = 0;

  setReturnValues(...values: EligibleObservation[][]): void {
    this.returnValues = values;
    this.callCount = 0;
  }

  eligibleObservations(): EligibleObservation[] {
    const idx = Math.min(this.callCount++, this.returnValues.length - 1);
    return this.returnValues[idx] ?? [];
  }
}

describe('CaseSelectorService', () => {
  let service: CaseSelectorService;
  let stubEligible: StubEligibleObservationService;

  beforeEach(() => {
    stubEligible = new StubEligibleObservationService();

    TestBed.configureTestingModule({
      providers: [
        CaseSelectorService,
        TrainerConfigurationService,
        { provide: EligibleObservationService, useValue: stubEligible },
        { provide: CASE_ORDERING_STRATEGY, useClass: IdentityOrderingStrategy },
      ],
    });

    service = TestBed.inject(CaseSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no observations are eligible', () => {
    stubEligible.setReturnValues([]);
    expect(service.nextCase()).toBeNull();
  });

  it('should return an observation when eligible observations exist', () => {
    const obs = [makeObs('Ua'), makeObs('Ub')];
    stubEligible.setReturnValues(obs);

    const result = service.nextCase();

    expect(result).toBeTruthy();
    expect(['Ua', 'Ub']).toContain(result!.candidate);
  });

  it('should return each case before repeating', () => {
    const obs = [makeObs('Ua'), makeObs('Ub'), makeObs('Z')];
    stubEligible.setReturnValues(obs, obs, obs);

    const seen = new Set<string>();
    for (let i = 0; i < obs.length; i++) {
      const result = service.nextCase();
      expect(result).toBeTruthy();
      seen.add(result!.candidate as string);
    }

    expect(seen.size).toBe(obs.length);
  });

  it('should cycle through all cases and start a new bag after exhausting current one', () => {
    const obs = [makeObs('Ua'), makeObs('Ub')];
    stubEligible.setReturnValues(obs, obs);

    service.nextCase();
    service.nextCase();

    const result = service.nextCase();
    expect(result).toBeTruthy();
    expect(['Ua', 'Ub']).toContain(result!.candidate);
  });

  it('should re-query eligible observations when bag is exhausted', () => {
    const obs1 = [makeObs('Ua'), makeObs('Ub')];
    const obs2 = [makeObs('Z'), makeObs('H')];
    stubEligible.setReturnValues(obs1, obs2);

    service.nextCase();
    service.nextCase();

    const result = service.nextCase();
    expect(result).toBeTruthy();
    expect(['Z', 'H']).toContain(result!.candidate);
  });

  it('should return null when bag exhausts and no observations remain', () => {
    const obs = [makeObs('Ua')];
    stubEligible.setReturnValues(obs, []);

    service.nextCase();
    const result = service.nextCase();

    expect(result).toBeNull();
  });

  it('should invalidate remaining bag when configuration version changes', () => {
    const obs1 = [makeObs('Ua'), makeObs('Ub'), makeObs('Z')];
    const obs2 = [makeObs('H')];
    stubEligible.setReturnValues(obs1, obs2);

    const configService = TestBed.inject(TrainerConfigurationService);
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    // Fill a bag of 3 and consume 1
    service.nextCase();

    // Change configuration mid-bag (bumps version)
    configService.enableGroup(group.key);

    // Next call should re-query (obs2), not serve from stale bag
    const result = service.nextCase();
    expect(result?.candidate).toBe('H');
  });

  it('should not present a disabled candidate after configuration changes mid-bag', () => {
    const obs1 = [makeObs('Ua'), makeObs('Ub')];
    const obs2 = [makeObs('Z')];
    stubEligible.setReturnValues(obs1, obs2);

    const configService = TestBed.inject(TrainerConfigurationService);
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    service.nextCase(); // consume from obs1
    configService.enableGroup(group.key); // bumps version

    // Stale bag entry (Ub) must not be served; fresh bag from obs2 should be
    const result = service.nextCase();
    expect(result?.candidate).toBe('Z');
  });
});
