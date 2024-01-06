import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { APP_ROUTES } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { addIcons } from 'ionicons';
import {
  pricetagSharp,
  pricetagOutline,
  bookSharp,
  bookOutline,
  calendarSharp,
  calendarOutline,
  fastFoodSharp,
  fastFoodOutline,
  listOutline,
  listSharp,
  add,
  alertCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
  ],
});

addIcons({
  pricetagSharp,
  pricetagOutline,
  bookSharp,
  bookOutline,
  calendarSharp,
  calendarOutline,
  fastFoodSharp,
  fastFoodOutline,
  listOutline,
  listSharp,
  add,
  alertCircleOutline,
  checkmarkCircleOutline,
});
