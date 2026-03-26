import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Player, ChessPiece, MaterialAdvantage, CapturedPieces } from '../../../core/services/game.service';

@Component({
  selector: 'app-player-info',
  imports: [CommonModule],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss'
})
export class PlayerInfoComponent implements OnInit {
  @Input() player: Player = { name: '', color: 'white', avatar: '' };
  @Input() isCurrentPlayer: boolean = false;
  
  capturedPieces: ChessPiece[] = [];
  materialAdvantage: MaterialAdvantage = { player: 'equal', advantage: 0 };

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.capturedPieces$.subscribe((captured: CapturedPieces) => {
      if (this.player) {
        this.capturedPieces = captured[this.player.color];
      }
    });

    this.gameService.capturedPieces$.subscribe(() => {
      this.materialAdvantage = this.gameService.getMaterialAdvantage();
    });
  }

  getPieceImage(piece: ChessPiece): string {
    const pieceLetters: { [key: string]: string } = {
      'king': 'K', 'queen': 'Q', 'rook': 'R', 'bishop': 'B', 'knight': 'N', 'pawn': 'p'
    };
    const colorPrefix = piece.color === 'white' ? 'w' : 'b';
    const pieceLetter = pieceLetters[piece.type];
    return `/chessPieces/${colorPrefix}${pieceLetter}.png`;
  }

  getCapturedPiecesByType(): { [key: string]: ChessPiece[] } {
    const grouped: { [key: string]: ChessPiece[] } = {};
    this.capturedPieces.forEach(piece => {
      if (!grouped[piece.type]) grouped[piece.type] = [];
      grouped[piece.type].push(piece);
    });
    return grouped;
  }

  shouldShowAdvantage(): boolean {
    return this.materialAdvantage.player === this.player?.color && this.materialAdvantage.advantage > 0;
  }
}