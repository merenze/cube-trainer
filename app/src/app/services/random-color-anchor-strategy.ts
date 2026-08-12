import { Injectable } from '@angular/core';
import { type ColorAnchorStrategy } from './color-anchor-strategy';
import { type EligibleObservation } from './eligible-observation.service';
import { rotateColorLayout, type SideColorIndex, type SideColorLayout } from '../domain/observation-color-layout';

@Injectable()
export class RandomColorAnchorStrategy implements ColorAnchorStrategy {
  selectLayout(observation: EligibleObservation): SideColorLayout {
    const canonical = observation.colorLayoutVariants[0]!;
    const offset = Math.floor(Math.random() * 4) as SideColorIndex;
    return rotateColorLayout(canonical, offset);
  }
}
