import { Injectable } from '@angular/core';
import { TrainerConfigurationService } from './trainer-configuration.service';
import {
  CANONICAL_RECOGNITION_GROUPS,
} from '../domain/recognition-groups';
import {
  getObservationColorMappingsForTriplet,
  type SideColorLayout,
} from '../domain/observation-color-catalog';
import { type PllPermutation } from '../domain/pll-catalog';

export interface EligibleObservation {
  candidate: PllPermutation;
  triplet: readonly [PllPermutation, string, string];
  colorLayoutVariants: readonly SideColorLayout[];
}

@Injectable({
  providedIn: 'root',
})
export class EligibleObservationService {
  constructor(private configService: TrainerConfigurationService) {}

  eligibleObservations(): EligibleObservation[] {
    const result: EligibleObservation[] = [];

    // Iterate through all enabled groups
    for (const groupKey of this.configService.enabledGroupKeys()) {
      // Find the group definition
      const group = CANONICAL_RECOGNITION_GROUPS.find(
        (g) => g.key === groupKey,
      );
      if (!group) {
        continue;
      }

      // Iterate through enabled candidates in this group
      for (const candidate of this.configService.enabledCandidateKeys(
        groupKey,
      )) {
        // Get color layout mappings for this candidate
        const mappings = getObservationColorMappingsForTriplet(
          candidate,
          group.leftPattern,
          group.rightPattern,
        );

        if (mappings.length > 0) {
          // Collect all color layouts from all mappings for this triplet
          const colorLayouts = mappings.map((m) => m.layout);
          result.push({
            candidate,
            triplet: [candidate, group.leftPattern, group.rightPattern] as const,
            colorLayoutVariants: colorLayouts,
          });
        }
      }
    }

    return result;
  }
}
