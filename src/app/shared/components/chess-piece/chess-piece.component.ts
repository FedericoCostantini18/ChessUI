import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  @Output() dragStart = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<void>();

  getPieceImage(): string {
    if (!this.piece) return '';
    
    // Mapping dei tipi di pezzo alle lettere del file
    const pieceLetters: { [key: string]: string } = {
      'king': 'K',
      'queen': 'Q', 
      'rook': 'R',
      'bishop': 'B',
      'knight': 'N',
      'pawn': 'p'
    };
    
    const colorPrefix = this.piece.color === 'white' ? 'w' : 'b';
    const pieceLetter = pieceLetters[this.piece.type];
    
    return `/chessPieces/${colorPrefix}${pieceLetter}.png`;
  }

  onDragStart(event: DragEvent): void {
    if (this.piece) {
      this.dragStart.emit();
    }
  }

  onDragEnd(event: DragEvent): void {
    this.dragEnd.emit();
  }
}
