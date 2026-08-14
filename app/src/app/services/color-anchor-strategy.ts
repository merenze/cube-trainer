import { InjectionToken } from '@angular/core';
import { type EligibleObservation } from './eligible-observation.service';
import { type SideColorLayout } from '../domain';

export const COLOR_ANCHOR_STRATEGY = new InjectionToken<ColorAnchorStrategy>('ColorAnchorStrategy');

export interface ColorAnchorStrategy {
  /** Selects which color layout variant to present to the user for this observation. */
  selectLayout(observation: EligibleObservation): SideColorLayout;
}
