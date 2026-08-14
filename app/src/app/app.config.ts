import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CASE_ORDERING_STRATEGY, ShuffledBagOrderingStrategy } from './features/candidate-selection';
import { COLOR_ANCHOR_STRATEGY } from './services/color-anchor-strategy';
import { RandomColorAnchorStrategy } from './services/random-color-anchor-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: CASE_ORDERING_STRATEGY, useClass: ShuffledBagOrderingStrategy },
    { provide: COLOR_ANCHOR_STRATEGY, useClass: RandomColorAnchorStrategy },
  ]
};
