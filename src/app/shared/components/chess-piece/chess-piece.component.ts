import { Component, Input } from '@angular/core';
import { ChessPiece } from '../../../core/services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chess-piece',
  imports: [CommonModule],
  templateUrl: './chess-piece.component.html',
  styleUrl: './chess-piece.component.scss'
})
export class ChessPieceComponent {
  @Input() piece: ChessPiece | null = null;

  getPieceSymbol(): string {
    if (!this.piece) return '';
    
    const symbols: { [key: string]: { white: string; black: string } } = {
      'king': { white: '♔', black: '♚' },
      'queen': { white: '♕', black: '♛' },
      'rook': { white: '♖', black: '♜' },
      'bishop': { white: '♗', black: '♝' },
      'knight': { white: '♘', black: '♞' },
      'pawn': { white: '♙', black: '♟' }
    };
    
    return symbols[this.piece.type][this.piece.color];
  }
}
