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
    path: 'game',
    loadComponent: () => import('./features/game/game-page/game-page.component').then(c => c.GamePageComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings-page/settings-page.component').then(c => c.SettingsPageComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/main-menu/main-menu.component').then(c => c.MainMenuComponent)
  }
];
