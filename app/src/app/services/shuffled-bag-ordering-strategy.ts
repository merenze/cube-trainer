import { type EligibleObservation } from './eligible-observation.service';
import { type CaseOrderingStrategy } from '../features/candidate-selection/services/case-ordering-strategy';

export class ShuffledBagOrderingStrategy implements CaseOrderingStrategy {
  order(observations: readonly EligibleObservation[]): readonly EligibleObservation[] {
    if (observations.length === 0) {
      return Object.freeze([]);
    }

    const shuffled = [...observations];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }

    return Object.freeze(shuffled);
  }
}
