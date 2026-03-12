import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  logoAnimationClass = '';
  username = '';
  password = '';
  showLoginForm = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Trigger the stamp animation after a short delay
    setTimeout(() => {
      this.logoAnimationClass = 'stamp-animation';
    }, 500);
    
    // Show login form after animation
    setTimeout(() => {
      this.showLoginForm = true;
    }, 1500);
  }

  onProceed() {
    if (this.username.trim() && this.password.trim()) {
      this.router.navigate(['/menu']);
    } else {
      alert('Inserisci username e password!');
    }
  }
}