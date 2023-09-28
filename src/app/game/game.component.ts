import { Component, HostListener } from '@angular/core';
import { GameService, STEP_NAME } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent {
  potentialMerlin: string | null = null;
  windowWidth: number = 0;

  constructor(private gameService: GameService, private router: Router) {

    if (this.gameService.getPlayers().length === 0) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.windowWidth = window.innerWidth;
  }

  getWinningTeamName() {
    return this.gameService.game?.winner;
  }

  selectPotentialMerlin(player: string) {
    this.potentialMerlin = player;
  }

  guessMerlin() {
    this.gameService.guessMerlin(this.potentialMerlin!)
  }

  isGuessingMerlin() {
    const currentMove = this.gameService.getCurrentMove() as any; // TODO: fix bad type
    return currentMove?.step === STEP_NAME.GuessMerlin && currentMove.player.player === this.gameService.getSelf().player;
  }

  isPlayerUnsorted(player: string) {
    return this.gameService.getSelf()?.unsorted?.includes(player);
  }

  isPlayerEnemy(player: string) {
    return this.gameService.getSelf()?.enemies?.includes(player);

  }

  isPlayerTeammate(player: string) {
    return this.gameService.getSelf()?.teammates?.includes(player);

  }

  getCurrentRound() {
    return this.gameService.game?.currentRound;
  }

  isGameOver() {
    return this.gameService.game?.nextMove?.step === STEP_NAME.GameOver;
  }

  getPlayerRole() {
    return this.gameService.getPlayerRole();
  }

  hasGameStarted() {
    return this.gameService.game?.isGameInProgress;
  }

  getGameId() {
    return this.gameService.getGameId();
  }

  toAdventureApprovalStep() {
    this.gameService.toAdventureApprovalStep();
  }

  getAdventureHistory() {
    return this.gameService.getAdventureHistory();
  }

  // only vote once per adventure to avoid sending multiple request, since vote cannote be changed
  voteAdventureOutcome(vote: 'success' | 'fail') {
    this.gameService.voteAdventureOutcome(vote);
  }

  isAdventurer() {
    return this.gameService.isAdventurer();
  }

  isAdventureOutcomeStep() {
    return this.gameService.isAdventureOutcomeStep();
  }

  isAdventureApprovalStep() {
    return this.gameService.isAdventureApprovalStep();
  }

  isAdventureApprovalVoter() {
    return this.gameService.isAdventureApprovalVoter();
  }

  approveAdventure(isAgree: boolean) {
    this.gameService.approveAdventure(isAgree);
  }

  isLobbyLeader() {
    return this.gameService.isLobbyLeader();
  }

  isGameInProgress() {
    return this.gameService.game?.isGameInProgress ?? false;
  }

  currentMove() {
    return this.gameService.getCurrentMove();
  }

  isCurrentPlayerMove() {
    return this.getPlayerId() === this.currentMove()?.player;
  }

  isSelectedPlayer(player: string) {
    return this.gameService.getSelectedPlayers()!.includes(player);
  }

  togglePlayer(player: string) {
    this.gameService.updateSelectedPlayers(player);
  }

  showChoosePlayerButton() {
    return this.isCurrentPlayerMove();
  }

  getPlayerId() {
    return this.gameService.socket.id;
  }

  startGame() {
    this.gameService.startGame();
  }

  getPlayers() {
    return this.gameService.getPlayers();
  }

  calculateTransform(player: string, players: Array<string>): string {
    const MAX_DISTANCE_X = this.windowWidth < 720 ? 128 : 256;
    const MAX_DISTANCE_Y = this.windowWidth < 720 ? 96 : 156;
    const playerPos = players.indexOf(this.gameService.socket.id);
    const idx = players.indexOf(player) - playerPos;
    const xOffset = Math.cos(Math.PI * 2 / players.length * idx + Math.PI / 2) * MAX_DISTANCE_X;
    const yOffset = Math.sin(Math.PI * 2 / players.length * idx + Math.PI / 2) * MAX_DISTANCE_Y;
    const translateString = `translate(calc(${xOffset}px - 50%), calc(${yOffset}px - 50%))`;
    return translateString;
  }

  getAdventureOutcome(adventure: number) {
    const adventureHistory = this.gameService.getAdventureHistory();
    const adventureOutcome = adventureHistory[adventure];
    return adventureOutcome;
    // TODO: should return number of player to choose for current adventure
  }

  getAdventurersForAdventure(adventure: number) {
    return this.gameService.game?.adventurersPerAdventure?.[adventure] ?? undefined;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }
}
