import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessBoardComponent } from '../../../shared/components/chess-board/chess-board.component';
import { GameService, Player } from '../../../core/services/game.service';
import { Observable } from 'rxjs';
import { PlayerInfoComponent } from '../../../shared/components/player-info/player-info.component';

@Component({
  selector: 'app-game-page',
  imports: [CommonModule, ChessBoardComponent, PlayerInfoComponent],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.scss'
})
export class GamePageComponent implements OnInit {
  players$: Observable<{ white: Player; black: Player }>;
  currentPlayer$: Observable<'white' | 'black'>;

  constructor(private gameService: GameService) {
    this.players$ = this.gameService.players$;
    this.currentPlayer$ = this.gameService.currentPlayer$;
  }

  ngOnInit(): void {
  }
}
