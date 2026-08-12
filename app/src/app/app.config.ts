import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CASE_ORDERING_STRATEGY } from './services/case-ordering-strategy';
import { ShuffledBagOrderingStrategy } from './services/shuffled-bag-ordering-strategy';
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
