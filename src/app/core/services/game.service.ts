import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
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
}
