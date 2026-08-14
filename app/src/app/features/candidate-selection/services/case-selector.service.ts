import { Injectable, Inject } from '@angular/core';
import { EligibleObservationService, type EligibleObservation } from './eligible-observation.service';
import { CASE_ORDERING_STRATEGY, type CaseOrderingStrategy } from './case-ordering-strategy';
import { TrainerConfigurationService } from '../../../services/trainer-configuration.service';

@Injectable({
  providedIn: 'root',
})
export class CaseSelectorService {
  private bag: readonly EligibleObservation[] = [];
  private index = 0;
  private capturedVersion = -1;

  constructor(
    private eligibleObservationService: EligibleObservationService,
    @Inject(CASE_ORDERING_STRATEGY) private orderingStrategy: CaseOrderingStrategy,
    private configService: TrainerConfigurationService,
  ) {}

  nextCase(): EligibleObservation | null {
    const currentVersion = this.configService.configurationVersion();
    if (this.index >= this.bag.length || currentVersion !== this.capturedVersion) {
      this.refillBag();
    }

    if (this.bag.length === 0) {
      return null;
    }

    return this.bag[this.index++] ?? null;
  }

  private refillBag(): void {
    const eligible = this.eligibleObservationService.eligibleObservations();
    this.bag = this.orderingStrategy.order(eligible);
    this.index = 0;
    this.capturedVersion = this.configService.configurationVersion();
  }
}
