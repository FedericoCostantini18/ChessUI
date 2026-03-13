import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle hamburger menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should toggle language menu', () => {
    expect(component.isLanguageMenuOpen).toBeFalse();
    
    component.toggleLanguageMenu();
    expect(component.isLanguageMenuOpen).toBeTrue();
    
    component.toggleLanguageMenu();
    expect(component.isLanguageMenuOpen).toBeFalse();
  });

  it('should select language and close menu', () => {
    component.isLanguageMenuOpen = true;
    
    component.selectLanguage('ES');
    
    expect(component.currentLanguage).toBe('ES');
    expect(component.isLanguageMenuOpen).toBeFalse();
  });

  it('should navigate to route and close menu', () => {
    component.isMenuOpen = true;
    
    component.navigateTo('/home');
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should close all menus', () => {
    component.isMenuOpen = true;
    component.isLanguageMenuOpen = true;
    
    component.closeMenus();
    
    expect(component.isMenuOpen).toBeFalse();
    expect(component.isLanguageMenuOpen).toBeFalse();
  });

  it('should have default language as EN', () => {
    expect(component.currentLanguage).toBe('EN');
  });

  it('should have available languages', () => {
    expect(component.availableLanguages).toEqual(['EN', 'ES', 'FR', 'DE', 'IT']);
  });
});