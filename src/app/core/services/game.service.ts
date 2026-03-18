import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
}

export interface Player {
  name: string;
  color: 'white' | 'black';
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private board: (ChessPiece | null)[][] = [];
  private currentPlayer = new BehaviorSubject<'white' | 'black'>('white');
  private players = new BehaviorSubject<{ white: Player; black: Player }>({
    white: { name: 'Giocatore 1', color: 'white', avatar: '👤' },
    black: { name: 'Giocatore 2', color: 'black', avatar: '👤' }
  });

  constructor() {
    this.initializeBoard();
  }

  get currentPlayer$() {
    return this.currentPlayer.asObservable();
  }

  get players$() {
    return this.players.asObservable();
  }

  getBoard(): (ChessPiece | null)[][] {
    return this.board;
  }

  private initializeBoard(): void {
    // Inizializza la scacchiera 8x8
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Posiziona i pezzi neri
    this.board[0] = [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' }
    ];
    
    for (let i = 0; i < 8; i++) {
      this.board[1][i] = { type: 'pawn', color: 'black' };
    }

    // Posiziona i pezzi bianchi
    for (let i = 0; i < 8; i++) {
      this.board[6][i] = { type: 'pawn', color: 'white' };
    }
    
    this.board[7] = [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' }
    ];
  }

  updatePlayers(whitePlayer: Partial<Player>, blackPlayer: Partial<Player>): void {
    const current = this.players.value;
    this.players.next({
      white: { ...current.white, ...whitePlayer },
      black: { ...current.black, ...blackPlayer }
    });
  }

  switchPlayer(): void {
    const current = this.currentPlayer.value;
    this.currentPlayer.next(current === 'white' ? 'black' : 'white');
  }

  movePiece(from: Position, to: Position): boolean {
    // Verifica che le posizioni siano valide
    if (!this.isValidPosition(from) || !this.isValidPosition(to)) {
      return false;
    }

    const piece = this.board[from.row][from.col];
    
    // Verifica che ci sia un pezzo nella posizione di partenza
    if (!piece) {
      return false;
    }

    // Verifica che sia il turno del giocatore corretto
    if (piece.color !== this.currentPlayer.value) {
      return false;
    }

    // Verifica che il movimento sia valido per questo tipo di pezzo
    if (!this.isValidMove(from, to, piece)) {
      return false;
    }

    // Esegui il movimento
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    // Cambia turno
    this.switchPlayer();

    return true;
  }

  canMoveTo(from: Position, to: Position): boolean {
    if (!this.isValidPosition(from) || !this.isValidPosition(to)) {
      return false;
    }

    const piece = this.board[from.row][from.col];
    if (!piece) {
      return false;
    }

    // Verifica che sia il turno del giocatore corretto
    if (piece.color !== this.currentPlayer.value) {
      return false;
    }

    return this.isValidMove(from, to, piece);
  }

  getPossibleMoves(position: Position): Position[] {
    const moves: Position[] = [];
    const piece = this.board[position.row][position.col];
    
    if (!piece || piece.color !== this.currentPlayer.value) {
      return moves;
    }

    // Controlla tutte le caselle della scacchiera
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const to: Position = { row, col };
        if (this.canMoveTo(position, to)) {
          moves.push(to);
        }
      }
    }

    return moves;
  }

  private isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 8 && 
           position.col >= 0 && position.col < 8;
  }

  private isValidMove(from: Position, to: Position, piece: ChessPiece): boolean {
    // Se la destinazione ha un pezzo dello stesso colore, il movimento non è valido
    const targetPiece = this.board[to.row][to.col];
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(from, to, piece);
      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(from, to);
      case 'bishop':
        return rowDiff === colDiff && this.isPathClear(from, to);
      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && this.isPathClear(from, to);
      case 'king':
        return rowDiff <= 1 && colDiff <= 1;
      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      default:
        return false;
    }
  }

  private isValidPawnMove(from: Position, to: Position, piece: ChessPiece): boolean {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    // Movimento in avanti di una casella
    if (colDiff === 0 && rowDiff === direction && !this.board[to.row][to.col]) {
      return true;
    }

    // Movimento in avanti di due caselle dalla posizione iniziale
    if (colDiff === 0 && rowDiff === 2 * direction && from.row === startRow && 
        !this.board[to.row][to.col] && !this.board[from.row + direction][from.col]) {
      return true;
    }

    // Cattura in diagonale
    if (colDiff === 1 && rowDiff === direction && this.board[to.row][to.col]) {
      return true;
    }

    return false;
  }

  private isPathClear(from: Position, to: Position): boolean {
    const rowStep = to.row === from.row ? 0 : (to.row > from.row ? 1 : -1);
    const colStep = to.col === from.col ? 0 : (to.col > from.col ? 1 : -1);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }
}
