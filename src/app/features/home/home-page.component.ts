import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  logoAnimationClass = '';

  ngOnInit() {
    // Trigger the stamp animation after a short delay
    setTimeout(() => {
      this.logoAnimationClass = 'stamp-animation';
    }, 500);
  }
}