import { Injectable } from '@angular/core';

export interface AIOpponent {
  id: string;
  name: string;
  description: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile' | 'Esperto';
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private selectedAI: AIOpponent | null = null;

  private aiOpponents: AIOpponent[] = [
    {
      id: 'rookie',
      name: 'Rookie',
      description: 'IA principiante perfetta per iniziare',
      difficulty: 'Facile',
      icon: '🤖',
      color: '#4CAF50'
    },
    {
      id: 'strategic',
      name: 'Strategic',
      description: 'IA tattica con buone strategie',
      difficulty: 'Medio',
      icon: '⚡',
      color: '#FF9800'
    },
    {
      id: 'master',
      name: 'Master',
      description: 'IA avanzata per sfide impegnative',
      difficulty: 'Difficile',
      icon: '👑',
      color: '#F44336'
    },
    {
      id: 'omega',
      name: 'Omega',
      description: 'IA suprema, solo per i più coraggiosi',
      difficulty: 'Esperto',
      icon: '🔥',
      color: '#9C27B0'
    }
  ];

  constructor() { }

  getAIOpponents(): AIOpponent[] {
    return this.aiOpponents;
  }

  selectAI(ai: AIOpponent): void {
    this.selectedAI = ai;
  }

  getSelectedAI(): AIOpponent | null {
    return this.selectedAI;
  }

  clearSelection(): void {
    this.selectedAI = null;
  }
}
