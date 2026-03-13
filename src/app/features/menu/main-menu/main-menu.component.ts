import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AiService, AIOpponent } from '../../../core/services/ai.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent implements OnInit {
  logoAnimationClass = '';
  showContent = false;
  aiOpponents: AIOpponent[] = [];
  selectedAI: AIOpponent | null = null;

  constructor(
    private router: Router,
    private aiService: AiService
  ) {}

  ngOnInit() {
    // Carica le IA disponibili
    this.aiOpponents = this.aiService.getAIOpponents();
    
    // Trigger the stamp animation after a short delay
    setTimeout(() => {
      this.logoAnimationClass = 'stamp-animation';
    }, 500);
    
    // Show content after animation
    setTimeout(() => {
      this.showContent = true;
    }, 1500);
  }

  selectAI(ai: AIOpponent) {
    this.selectedAI = ai;
    this.aiService.selectAI(ai);
  }

  startGame() {
    if (this.selectedAI) {
      this.router.navigate(['/game']);
    } else {
      alert('Seleziona un avversario IA prima di iniziare!');
    }
  }
}
