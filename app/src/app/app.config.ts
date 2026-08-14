import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CASE_ORDERING_STRATEGY, COLOR_ANCHOR_STRATEGY, RandomColorAnchorStrategy, ShuffledBagOrderingStrategy } from './features/candidate-selection';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: CASE_ORDERING_STRATEGY, useClass: ShuffledBagOrderingStrategy },
    { provide: COLOR_ANCHOR_STRATEGY, useClass: RandomColorAnchorStrategy },
  ]
};
