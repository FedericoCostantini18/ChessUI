import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public isMenuOpen = false;
  public currentLanguage = 'EN';
  public availableLanguages = ['EN', 'ES', 'FR', 'DE', 'IT'];
  public isLanguageMenuOpen = false;

  constructor(private router: Router) {}

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  public selectLanguage(language: string): void {
    this.currentLanguage = language;
    this.isLanguageMenuOpen = false;
    // Here you can implement actual language switching logic
    console.log('Language changed to:', language);
  }

  public navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  public closeMenus(): void {
    this.isMenuOpen = false;
    this.isLanguageMenuOpen = false;
  }
}