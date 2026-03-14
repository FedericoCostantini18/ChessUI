import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessSquareComponent } from '../chess-square/chess-square.component';
import { GameService, ChessPiece } from '../../../core/services/game.service';

@Component({
  selector: 'app-chess-board',
  imports: [CommonModule, ChessSquareComponent],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss'
})
export class ChessBoardComponent implements OnInit {
  board: (ChessPiece | null)[][] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.board = this.gameService.getBoard();
  }

  isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }
}
