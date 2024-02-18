import { Routes } from '@angular/router';

export const ACTIVITY_TYPES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./activity-types-page/activity-types.page').then(
        (m) => m.ActivityTypesPage,
      ),
  },
];
