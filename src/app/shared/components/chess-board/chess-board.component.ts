import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessSquareComponent } from '../chess-square/chess-square.component';
import { GameService, ChessPiece, Position, GameState } from '../../../core/services/game.service';

@Component({
  selector: 'app-chess-board',
  imports: [CommonModule, ChessSquareComponent],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss'
})
export class ChessBoardComponent implements OnInit {
  board: (ChessPiece | null)[][] = [];
  selectedSquare: Position | null = null;
  possibleMoves: Position[] = [];
  draggedPiece: { piece: ChessPiece; from: Position } | null = null;
  gameState: GameState = {
    isCheck: false,
    isCheckmate: false,
    isStalemate: false
  };

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.board = this.gameService.getBoard();
    
    // Subscribe allo stato del gioco
    this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
    });
  }

  isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  onSquareClick(row: number, col: number): void {
    const clickedPosition: Position = { row, col };
    
    // Se c'è già un pezzo selezionato
    if (this.selectedSquare) {
      // Se clicchiamo sulla stessa casella, deseleziona
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        this.clearSelection();
        return;
      }
      
      // Prova a muovere il pezzo
      if (this.gameService.movePiece(this.selectedSquare, clickedPosition)) {
        this.board = this.gameService.getBoard();
        this.clearSelection();
      } else {
        // Se il movimento non è valido, seleziona il nuovo pezzo (se presente)
        this.selectSquare(clickedPosition);
      }
    } else {
      // Nessun pezzo selezionato, seleziona il pezzo cliccato (se presente)
      this.selectSquare(clickedPosition);
    }
  }

  onDragStart(row: number, col: number): void {
    const piece = this.board[row][col];
    if (piece) {
      this.draggedPiece = { piece, from: { row, col } };
      this.possibleMoves = this.gameService.getPossibleMoves({ row, col });
    }
  }

  onDragEnd(): void {
    this.draggedPiece = null;
    this.possibleMoves = [];
  }

  onDrop(row: number, col: number): boolean {
    if (!this.draggedPiece) return false;
    
    const success = this.gameService.movePiece(this.draggedPiece.from, { row, col });
    if (success) {
      this.board = this.gameService.getBoard();
    }
    
    this.onDragEnd();
    return success;
  }

  private selectSquare(position: Position): void {
    const piece = this.board[position.row][position.col];
    
    if (piece) {
      this.selectedSquare = position;
      this.possibleMoves = this.gameService.getPossibleMoves(position);
    } else {
      this.clearSelection();
    }
  }

  private clearSelection(): void {
    this.selectedSquare = null;
    this.possibleMoves = [];
  }

  isSquareSelected(row: number, col: number): boolean {
    return this.selectedSquare?.row === row && this.selectedSquare?.col === col;
  }

  isSquareHighlighted(row: number, col: number): boolean {
    return this.possibleMoves.some(move => move.row === row && move.col === col);
  }

  isKingInCheck(row: number, col: number): boolean {
    return this.gameState.isCheck && 
           this.gameState.checkedKingPosition?.row === row && 
           this.gameState.checkedKingPosition?.col === col;
  }

  newGame(): void {
    this.clearSelection();
    this.gameService.newGame();
    this.board = this.gameService.getBoard();
  }
}
