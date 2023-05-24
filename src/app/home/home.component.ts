import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Socket, io } from 'socket.io-client';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  joinRoomForm = new FormGroup({
    gameId: new FormControl(''),
  });

  constructor(private gameService: GameService) {}

  joinRoom() {
    this.gameService.joinGame(this.joinRoomForm.controls.gameId.value!)
  }

  createGame(){
    this.gameService.createGame();
  }
}
