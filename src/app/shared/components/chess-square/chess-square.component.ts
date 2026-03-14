import { Component, Input } from '@angular/core';
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

  get squareClass(): string {
    return this.isLight ? 'light' : 'dark';
  }
}
