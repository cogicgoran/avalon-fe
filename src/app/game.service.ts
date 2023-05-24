import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  socket!: Socket;
  game: {
    id: string;
    players: Array<string>;
    nextMove: {
      step: "vote",
      player: string,
      votes: number,
    };
  } | null = null;

  constructor(private router: Router) {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      this.socket = socket;
      this.socket.on('userJoinedGame', (gameInstance) => {
        console.log('userJoined'); // Todo: emit notification
        if (gameInstance.id === this.game?.id) {
          this.game = gameInstance;
        }
      });
      this.socket.on('gameJoined', (gameInstance) => {
        this.game = gameInstance;
        this.router.navigate(['/game']);
      });
      const listener = (gameInstance: any) => {
        console.log(gameInstance);
        this.game = gameInstance;
        this.socket.off('gameCreated', listener);
        this.router.navigate(['/game']);
      };
      this.socket.on('gameCreated', listener);

      this.socket.on('gameStarted', (gameInstance, error) => {
        if (error) {
          console.log(error);
          return;
        }
        this.game = gameInstance;
        this.handleNextMove();
      });
    });
  }

  startGame() {
    if (!this.isGameStartValid()) {
      // Show notification
      console.log('Game must have between 5 and 10 players');
      return;
    }
    this.socket.emit('startGame', this.game?.id);
  }

  isGameStartValid() {
    const players = this.getPlayers();
    return players.length >= 5 && players.length <= 10;
  }

  handleNextMove(){
    const isCurrentPlayerMove = this.game?.nextMove.player === this.socket.id;
    this.game?.nextMove
    // CONTINUE
  }

  createGame() {
    this.socket.emit('createGame');
  }

  joinGame(gameId: string) {
    this.socket.emit('joinGame', parseInt(gameId));
  }

  getPlayers() {
    return this.game?.players ?? [];
  }


}
