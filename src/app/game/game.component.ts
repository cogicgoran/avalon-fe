import { Component } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent {
  constructor(private gameService: GameService, private router: Router) {
    if (this.gameService.getPlayers().length === 0) {
      this.router.navigate(['/']);
    }
  }

  startGame(){
    this.gameService.startGame()
  }

  getPlayers() {
    return this.gameService.getPlayers();
  }

}
