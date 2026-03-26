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
  capturedPiece?: ChessPiece;
  timestamp: Date;
  notation: string; // Notazione algebrica
}

export interface GameState {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  checkedKingPosition?: Position;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface MaterialAdvantage {
  player: 'white' | 'black' | 'equal';
  advantage: number;
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
  private gameState = new BehaviorSubject<GameState>({
    isCheck: false,
    isCheckmate: false,
    isStalemate: false
  });
  private capturedPieces = new BehaviorSubject<CapturedPieces>({
    white: [],
    black: []
  });
  private moveHistory: Move[] = [];
  private readonly STORAGE_KEY = 'chess_move_history';

  // Valori dei pezzi per il calcolo del vantaggio di materiale
  private readonly PIECE_VALUES: { [key: string]: number } = {
    'pawn': 1,
    'knight': 3,
    'bishop': 3,
    'rook': 5,
    'queen': 9,
    'king': 0
  };

  constructor() {
    this.initializeBoard();
    this.loadMoveHistory();
  }

  get currentPlayer$() {
    return this.currentPlayer.asObservable();
  }

  get players$() {
    return this.players.asObservable();
  }

  get gameState$() {
    return this.gameState.asObservable();
  }

  get capturedPieces$() {
    return this.capturedPieces.asObservable();
  }

  getBoard(): (ChessPiece | null)[][] {
    return this.board;
  }

  getMaterialAdvantage(): MaterialAdvantage {
    const captured = this.capturedPieces.value;
    
    let whitePoints = 0;
    let blackPoints = 0;

    // Calcola i punti dei pezzi catturati dal bianco (pezzi neri catturati)
    captured.white.forEach(piece => {
      whitePoints += this.PIECE_VALUES[piece.type];
    });

    // Calcola i punti dei pezzi catturati dal nero (pezzi bianchi catturati)
    captured.black.forEach(piece => {
      blackPoints += this.PIECE_VALUES[piece.type];
    });

    const difference = whitePoints - blackPoints;

    if (difference > 0) {
      return { player: 'white', advantage: difference };
    } else if (difference < 0) {
      return { player: 'black', advantage: Math.abs(difference) };
    } else {
      return { player: 'equal', advantage: 0 };
    }
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

    // Verifica che il movimento non metta in scacco il proprio re
    if (this.wouldBeInCheckAfterMove(from, to, piece.color)) {
      return false;
    }

    // Salva il pezzo catturato (se presente)
    const capturedPiece = this.board[to.row][to.col];

    // Esegui il movimento
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    // Aggiorna i pezzi catturati se c'è stata una cattura
    if (capturedPiece) {
      this.addCapturedPiece(capturedPiece, piece.color);
    }

    // Crea la mossa per la cronologia
    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      timestamp: new Date(),
      notation: this.generateMoveNotation(from, to, piece, capturedPiece)
    };

    // Salva la mossa nella cronologia
    this.addMoveToHistory(move);

    // Cambia turno
    this.switchPlayer();

    // Aggiorna lo stato del gioco
    this.updateGameState();

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

    // Verifica che il movimento sia valido e non metta in scacco il proprio re
    return this.isValidMove(from, to, piece) && !this.wouldBeInCheckAfterMove(from, to, piece.color);
  }

  getPossibleMoves(position: Position): Position[] {
    const piece = this.board[position.row][position.col];
    
    if (!piece || piece.color !== this.currentPlayer.value) {
      return [];
    }

    return this.getPossibleMovesForPiece(position);
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

  // Metodi per la gestione della cronologia delle mosse
  private loadMoveHistory(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.moveHistory = JSON.parse(saved).map((move: any) => ({
          ...move,
          timestamp: new Date(move.timestamp)
        }));
      }
    } catch (error) {
      console.error('Errore nel caricamento della cronologia:', error);
      this.moveHistory = [];
    }
  }

  private saveMoveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.moveHistory));
    } catch (error) {
      console.error('Errore nel salvataggio della cronologia:', error);
    }
  }

  private addMoveToHistory(move: Move): void {
    this.moveHistory.push(move);
    this.saveMoveHistory();
  }

  private generateMoveNotation(from: Position, to: Position, piece: ChessPiece, capturedPiece?: ChessPiece | null): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const fromSquare = files[from.col] + ranks[from.row];
    const toSquare = files[to.col] + ranks[to.row];
    
    let notation = '';
    
    // Aggiungi il simbolo del pezzo (tranne per i pedoni)
    if (piece.type !== 'pawn') {
      const pieceSymbols = {
        'king': 'K', 'queen': 'Q', 'rook': 'R',
        'bishop': 'B', 'knight': 'N', 'pawn': ''
      };
      notation += pieceSymbols[piece.type];
    }
    
    // Se c'è una cattura
    if (capturedPiece) {
      if (piece.type === 'pawn') {
        notation += files[from.col];
      }
      notation += 'x';
    }
    
    notation += toSquare;
    
    return notation;
  }

  // Metodi per la logica di scacco e scaccomatto
  private findKing(color: 'white' | 'black'): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  private isPositionUnderAttack(position: Position, attackingColor: 'white' | 'black'): boolean {
    // Controlla se qualche pezzo del colore specificato può attaccare questa posizione
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === attackingColor) {
          // Verifica se questo pezzo può attaccare la posizione target
          if (this.canPieceAttackPosition({ row, col }, position, piece)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private canPieceAttackPosition(from: Position, to: Position, piece: ChessPiece): boolean {
    // Simile a isValidMove ma senza controllare se il target ha un pezzo dello stesso colore
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    switch (piece.type) {
      case 'pawn':
        return this.canPawnAttackPosition(from, to, piece);
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

  private canPawnAttackPosition(from: Position, to: Position, piece: ChessPiece): boolean {
    const direction = piece.color === 'white' ? -1 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    
    // I pedoni attaccano solo in diagonale
    return colDiff === 1 && rowDiff === direction;
  }

  private isInCheck(color: 'white' | 'black'): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) {
      return false;
    }
    
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isPositionUnderAttack(kingPosition, opponentColor);
  }

  private wouldBeInCheckAfterMove(from: Position, to: Position, color: 'white' | 'black'): boolean {
    // Simula la mossa per vedere se il re sarebbe in scacco
    const originalPiece = this.board[from.row][from.col];
    const capturedPiece = this.board[to.row][to.col];
    
    // Esegui temporaneamente la mossa
    this.board[to.row][to.col] = originalPiece;
    this.board[from.row][from.col] = null;
    
    const wouldBeInCheck = this.isInCheck(color);
    
    // Ripristina la posizione originale
    this.board[from.row][from.col] = originalPiece;
    this.board[to.row][to.col] = capturedPiece;
    
    return wouldBeInCheck;
  }

  private hasValidMoves(color: 'white' | 'black'): boolean {
    // Controlla se il giocatore ha mosse valide
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          const moves = this.getPossibleMovesForPiece({ row, col });
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private getPossibleMovesForPiece(position: Position): Position[] {
    const moves: Position[] = [];
    const piece = this.board[position.row][position.col];
    
    if (!piece) {
      return moves;
    }

    // Controlla tutte le caselle della scacchiera
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const to: Position = { row, col };
        if (this.isValidMove(position, to, piece) && !this.wouldBeInCheckAfterMove(position, to, piece.color)) {
          moves.push(to);
        }
      }
    }

    return moves;
  }

  private updateGameState(): void {
    const currentPlayerColor = this.currentPlayer.value;
    const isCheck = this.isInCheck(currentPlayerColor);
    const hasValidMoves = this.hasValidMoves(currentPlayerColor);
    
    let newState: GameState = {
      isCheck,
      isCheckmate: isCheck && !hasValidMoves,
      isStalemate: !isCheck && !hasValidMoves,
    };

    if (isCheck) {
      newState.checkedKingPosition = this.findKing(currentPlayerColor) || undefined;
    }

    this.gameState.next(newState);

    // Se c'è checkmate o stalemate, la partita è finita
    if (newState.isCheckmate || newState.isStalemate) {
      console.log(newState.isCheckmate ? 
        `Scaccomatto! Vince ${currentPlayerColor === 'white' ? 'nero' : 'bianco'}!` : 
        'Stallo! Partita patta!');
    }
  }

  // Metodo per iniziare una nuova partita
  newGame(): void {
    this.initializeBoard();
    this.currentPlayer.next('white');
    this.gameState.next({
      isCheck: false,
      isCheckmate: false,
      isStalemate: false
    });
    this.capturedPieces.next({
      white: [],
      black: []
    });
    // Pulisce la cronologia per la nuova partita
    this.moveHistory = [];
    this.saveMoveHistory();
  }

  private addCapturedPiece(capturedPiece: ChessPiece, capturedBy: 'white' | 'black'): void {
    const currentCaptured = this.capturedPieces.value;
    
    if (capturedBy === 'white') {
      // Il bianco ha catturato un pezzo nero
      currentCaptured.white.push(capturedPiece);
    } else {
      // Il nero ha catturato un pezzo bianco  
      currentCaptured.black.push(capturedPiece);
    }
    
    this.capturedPieces.next(currentCaptured);
  }
}
