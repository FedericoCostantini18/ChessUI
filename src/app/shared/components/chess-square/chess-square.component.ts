import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ChessPiece } from '../../../core/services/game.service';
import { ChessPieceComponent } from '../chess-piece/chess-piece.component';

@Component({
  selector: 'app-chess-square',
  imports: [ChessPieceComponent],
  templateUrl: './chess-square.component.html',
  styleUrl: './chess-square.component.scss'
})
export class ChessSquareComponent {
  @Input() piece: ChessPiece | null = null;
  @Input() row: number = 0;
  @Input() col: number = 0;
  @Input() isLight: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isHighlighted: boolean = false;

  @Output() squareClick = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() drop = new EventEmitter<void>();

  get squareClass(): string {
    let classes = this.isLight ? 'light' : 'dark';
    
    if (this.isSelected) {
      classes += ' selected';
    }
    
    if (this.isHighlighted) {
      classes += ' highlighted';
    }

    return classes;
  }

  onClick(): void {
    this.squareClick.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.drop.emit();
  }

  onPieceDragStart(): void {
    this.dragStart.emit();
  }

  onPieceDragEnd(): void {
    this.dragEnd.emit();
  }
}
