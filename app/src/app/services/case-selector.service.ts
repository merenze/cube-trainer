import { Injectable, Inject } from '@angular/core';
import { EligibleObservationService, type EligibleObservation } from './eligible-observation.service';
import { CASE_ORDERING_STRATEGY, type CaseOrderingStrategy } from './case-ordering-strategy';

@Injectable({
  providedIn: 'root',
})
export class CaseSelectorService {
  private bag: readonly EligibleObservation[] = [];
  private index = 0;

  constructor(
    private eligibleObservationService: EligibleObservationService,
    @Inject(CASE_ORDERING_STRATEGY) private orderingStrategy: CaseOrderingStrategy,
  ) {}

  nextCase(): EligibleObservation | null {
    if (this.index >= this.bag.length) {
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
  }
}
