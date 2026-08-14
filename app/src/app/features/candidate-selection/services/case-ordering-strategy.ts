import { InjectionToken } from '@angular/core';
import { type EligibleObservation } from '../../../services/eligible-observation.service';

export const CASE_ORDERING_STRATEGY = new InjectionToken<CaseOrderingStrategy>('CaseOrderingStrategy');

/**
 * Abstraction for ordering cases presented to the trainer.
 */
export interface CaseOrderingStrategy {
  /**
   * Orders the given eligible observations according to the strategy's algorithm.
   * @param observations The observations to order
   * @returns A readonly array of observations in the determined order
   */
  order(observations: readonly EligibleObservation[]): readonly EligibleObservation[];
}
