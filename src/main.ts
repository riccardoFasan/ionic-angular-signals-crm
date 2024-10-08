import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
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
  caretDownSharp,
  pizzaSharp,
  pizzaOutline,
  calendarClearSharp,
  calendarClearOutline,
  trashBinOutline,
  trashBinSharp,
  bicycleSharp,
  bicycleOutline,
  sunnySharp,
  sunnyOutline,
  trainSharp,
  trainOutline,
  rocketSharp,
  rocketOutline,
  planetSharp,
  planetOutline,
  pulseSharp,
  pulseOutline,
  walkSharp,
  walkOutline,
  bedSharp,
  bedOutline,
  skullSharp,
  skullOutline,
} from 'ionicons/icons';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideIonicAngular(),
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
  caretDownSharp,
  pizzaSharp,
  pizzaOutline,
  calendarClearSharp,
  calendarClearOutline,
  trashBinOutline,
  trashBinSharp,
  bicycleSharp,
  bicycleOutline,
  sunnySharp,
  sunnyOutline,
  trainSharp,
  trainOutline,
  rocketSharp,
  rocketOutline,
  planetSharp,
  planetOutline,
  pulseSharp,
  pulseOutline,
  walkSharp,
  walkOutline,
  bedSharp,
  bedOutline,
  skullSharp,
  skullOutline,
});
