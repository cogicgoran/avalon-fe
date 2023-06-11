import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';

export enum EMITABLE_GAME_EVENTS {
  CreateGame = 'createGame',
  JoinGame = 'joinGame',
  StartGame = 'startGame',
  ToAdventureApprovalStep = 'toAdventureApprovalStep',
  ChoosePlayerForAdventure = 'choosePlayerForAdventure',
  ApproveAdventureVote = 'approveAdventureVote',
  AdventureVote = 'adventureVote',
}

export enum LISTENABLE_GAME_EVENTS {
  UserJoinedGame = 'userJoinedGame',
  GameJoined = 'gameJoined',
  GameCreated = 'gameCreated',
  GameStarted = 'gameStarted',
  AdventurePlayersUpdated = 'adventurePlayersUpdated',
  AdventureApproval = 'adventureApproval',
  AdventureVoteUpdate = 'adventureVoteUpdate',
  AdventureApprovalEnd = 'adventureApprovalEnd',
  MerlinGuessResult = 'merlinGuessResult'
}

export enum STEP_NAME {
  ChooseAdventurePlayers,
  AdventureApproval,
  AdventureOutcomeVoting,
  GuessMerlin,
  GameOver
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  socket!: Socket;
  game: {
    id: string;
    players: Array<string>;
    nextMove: {
      step: STEP_NAME;
      player: string;
      votes: number;
    };
    selectedAdventurePlayers: Array<string>;
    isGameInProgress: boolean;
    lobbyLeader: string;
    adventureHistory: Array<number>;
    playersWithRoles: Array<any>;
    currentRound: number;
    winner: 'evil' | 'good';
  } | null = null;
  isCurrentPlayerMove = false;

  constructor(private router: Router) {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      this.socket = socket;
      this.socket.on(LISTENABLE_GAME_EVENTS.UserJoinedGame, (gameInstance) => {
        console.log('userJoined'); // Todo: emit notification
        if (gameInstance.id === this.game?.id) {
          this.game = gameInstance;
        }
      });
      this.socket.on(LISTENABLE_GAME_EVENTS.GameJoined, (gameInstance) => {
        this.game = gameInstance;
        this.router.navigate(['/game']);
      });
      const listener = (gameInstance: any) => {
        console.log(gameInstance);
        this.game = gameInstance;
        this.socket.off(LISTENABLE_GAME_EVENTS.GameCreated, listener);
        this.router.navigate(['/game']);
      };
      this.socket.on(LISTENABLE_GAME_EVENTS.GameCreated, listener);

      this.socket.on(
        LISTENABLE_GAME_EVENTS.GameStarted,
        (gameInstance, error) => {
          if (error) {
            console.log(error);
            return;
          }
          this.game = gameInstance;
        }
      );

      this.socket.on(
        LISTENABLE_GAME_EVENTS.AdventurePlayersUpdated,
        (gameInstance) => {
          console.log('updateRetrieved:', gameInstance);
          if (this.game?.id === gameInstance.id) {
            this.game = gameInstance;
          }
        }
      );

      this.socket.on(
        LISTENABLE_GAME_EVENTS.AdventureApproval,
        (error, gameInstance) => {
          if (error) {
            console.log(error);
            // TODO: handle error
            return;
          }
          this.game = gameInstance;
        }
      );

      this.socket.on(
        LISTENABLE_GAME_EVENTS.AdventureVoteUpdate,
        (gameInstance) => {
          if (this.game?.id !== gameInstance.id) return;
          this.game = gameInstance;
        }
      );

      this.socket.on(
        LISTENABLE_GAME_EVENTS.AdventureApprovalEnd,
        (error, gameInstance) => {
          if (error) {
            // TODO: handle error
          }
          this.game = gameInstance;
        }
      );

      this.socket.on(LISTENABLE_GAME_EVENTS.MerlinGuessResult, (error, gameInstance) => {
        if(error) {
          // TODO: handle error
        }
        if(gameInstance.id !== this.game?.id) return;
        console.log(gameInstance);
        this.game = gameInstance;
      })
    });
  }

  guessMerlin(player: string) {
    this.socket.emit('guessMerlin', this.game!.id, player);
  }

  getPlayerRole() {
    return this.game?.playersWithRoles.find(
      ({ player }) => player === this.socket.id
    )?.role.name;
  }

  getSelf() {
    return this.game?.playersWithRoles.find(
      ({ player }) => player === this.socket.id
    );
  }

  getAdventureHistory() {
    return this.game?.adventureHistory ?? [];
  }

  getGameId() {
    return this.game?.id;
  }

  isAdventureOutcomeStep() {
    return this.game?.nextMove?.step === STEP_NAME.AdventureOutcomeVoting;
  }

  isAdventureApprovalStep() {
    return this.game?.nextMove?.step === STEP_NAME.AdventureApproval;
  }

  isAdventurer() {
    return this.getSelectedPlayers()?.includes(this.socket.id);
  }

  isAdventureApprovalVoter() {
    return !this.getSelectedPlayers()?.includes(this.socket.id);
  }

  approveAdventure(isAgree: boolean) {
    this.socket.emit(
      EMITABLE_GAME_EVENTS.ApproveAdventureVote,
      this.game?.id,
      this.socket.id,
      isAgree
    );
  }

  voteAdventureOutcome(vote: 'success' | 'fail') {
    this.socket.emit(
      EMITABLE_GAME_EVENTS.AdventureVote,
      this.game?.id,
      this.socket.id,
      vote
    );
  }

  toAdventureApprovalStep() {
    this.socket.emit(
      EMITABLE_GAME_EVENTS.ToAdventureApprovalStep,
      this.game!.id
    );
  }

  isLobbyLeader() {
    return this.socket.id === this.game?.lobbyLeader;
  }

  getSelectedPlayers() {
    return this.game?.selectedAdventurePlayers;
  }

  updateSelectedPlayers(player: string) {
    console.log('before modify:', this.game?.selectedAdventurePlayers);
    if (!this.game?.selectedAdventurePlayers.includes(player)) {
      this.game?.selectedAdventurePlayers.push(player);
    } else {
      this.game.selectedAdventurePlayers =
        this.game?.selectedAdventurePlayers.filter(
          (selectedPlayer) => selectedPlayer !== player
        );
    }
    console.log('before emit:', this.game?.selectedAdventurePlayers);
    this.socket.emit(
      EMITABLE_GAME_EVENTS.ChoosePlayerForAdventure,
      this.game?.id,
      this.game?.selectedAdventurePlayers
    );
  }

  getCurrentMove() {
    return this.game?.nextMove;
  }

  startGame() {
    if (!this.isGameStartValid()) {
      // Show notification
      console.log('Game must have between 5 and 10 players');
      return;
    }
    this.socket.emit(EMITABLE_GAME_EVENTS.StartGame, this.game?.id);
  }

  isGameStartValid() {
    const players = this.getPlayers();
    return players.length >= 5 && players.length <= 10;
  }

  // handleNextMove(){
  //   this.isCurrentPlayerMove = this.game?.nextMove.player === this.socket.id;
  // }

  createGame() {
    this.socket.emit(EMITABLE_GAME_EVENTS.CreateGame);
  }

  joinGame(gameId: string) {
    this.socket.emit(EMITABLE_GAME_EVENTS.JoinGame, parseInt(gameId));
  }

  getPlayers() {
    return this.game?.players ?? [];
  }
}
