import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home-page.component').then(c => c.HomePageComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/main-menu/main-menu.component').then(c => c.MainMenuComponent)
  }
];
