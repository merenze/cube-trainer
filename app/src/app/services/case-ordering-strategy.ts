import { type EligibleObservation } from './eligible-observation.service';

/**
 * Abstraction for ordering cases presented to the trainer.
 * Different implementations provide different ordering strategies (e.g., random, weighted, sequential).
 */
export interface CaseOrderingStrategy {
  /**
   * Orders the given eligible observations according to the strategy's algorithm.
   * @param observations The observations to order
   * @returns A readonly array of observations in the determined order
   */
  order(observations: readonly EligibleObservation[]): readonly EligibleObservation[];
}
