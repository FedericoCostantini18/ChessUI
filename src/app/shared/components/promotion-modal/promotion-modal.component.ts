import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService, PawnPromotion } from '../../../core/services/game.service';

@Component({
  selector: 'app-promotion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotion-modal.component.html',
  styleUrls: ['./promotion-modal.component.scss']
})
export class PromotionModalComponent implements OnInit, OnDestroy {
  currentPromotion: PawnPromotion | null = null;
  private promotionSubscription?: Subscription;

  readonly pieceOptions = [
    { type: 'queen' as const, label: 'Regina', symbol: 'Q' },
    { type: 'rook' as const, label: 'Torre', symbol: 'R' },
    { type: 'bishop' as const, label: 'Alfiere', symbol: 'B' },
    { type: 'knight' as const, label: 'Cavallo', symbol: 'N' }
  ];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.promotionSubscription = this.gameService.pendingPromotion$.subscribe(
      promotion => {
        this.currentPromotion = promotion;
      }
    );
  }

  ngOnDestroy(): void {
    this.promotionSubscription?.unsubscribe();
  }

  onPieceSelect(pieceType: 'queen' | 'rook' | 'bishop' | 'knight'): void {
    this.gameService.completePawnPromotion(pieceType);
  }

  getPieceImagePath(pieceType: string, color: string): string {
    const colorPrefix = color === 'white' ? 'w' : 'b';
    const pieceSymbol = pieceType === 'queen' ? 'Q' :
                      pieceType === 'rook' ? 'R' :
                      pieceType === 'bishop' ? 'B' :
                      pieceType === 'knight' ? 'N' : '';
    return `/chessPieces/${colorPrefix}${pieceSymbol}.png`;
  }
}