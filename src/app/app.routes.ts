import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'diary',
    pathMatch: 'full',
  },
  {
    path: 'diary',
    loadComponent: () => import('./diary/diary.page').then((m) => m.DiaryPage),
  },
  {
    path: 'events',
    loadComponent: () => import('./diary/diary.page').then((m) => m.DiaryPage),
  },
];
