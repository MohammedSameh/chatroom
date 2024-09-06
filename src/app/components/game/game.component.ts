import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

interface Response {
  user: string;
  response: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  roomCode: string = '';
  currentPrompt: string = '';
  promptNumber: number = 1;
  responseText: string = '';
  responseSubmitted: boolean = false;
  responseList: Response[] = [];
  voting: boolean = false;
  selectedVote: string = '';
  winner: string = '';
  gameOver: boolean = false;
  showWinner: boolean = false;  // Control for winner view
  voteSubmitted: boolean = false;
  voteTimeLeft: number = 30;
  private subscriptions: Subscription[] = [];
  timeLeft: number = 60;
  isHost: boolean = false;
  timerInterval: any = null; // Store the round timer interval reference
  voteTimerInterval: any = null; // Store the voting timer interval reference

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode') || '';
    const storedIsHost = localStorage.getItem('isHost');
    if (storedIsHost) {
      this.isHost = JSON.parse(storedIsHost);
    }
    this.startTimer();

    // Listen for new prompts
    const sub1 = this.socketService.onNewPrompt().subscribe((data: any) => {
      this.currentPrompt = data.prompt;
      this.promptNumber = data.promptNumber;
      this.resetGameState();
      this.startTimer(); // Restart the timer when a new prompt is received
    });

    // Listen for showing responses
    const sub2 = this.socketService.onShowResponses().subscribe((responses: any) => {
      // Expecting to receive responses with usernames
      this.responseList = Object.keys(responses).map(username => ({
        user: username, // Displays the username
        response: responses[username]
      }));
    });

    // Listen for the start of voting (from the server) and start voting timer
    const sub3 = this.socketService.onStartVoting().subscribe(() => {
      this.voting = true;
      this.startVotingTimer();
    });

    // Listen for round winner
    const sub4 = this.socketService.onRoundWinner().subscribe((data: any) => {
      // Update the winner in the UI
      if (Array.isArray(data.winner)) {
        this.winner = "It's a tie! Winners: " + data.winner.join(", ");
      } else {
        this.winner = "Winner: " + data.winner;
      }
      this.voting = false;
      clearInterval(this.timerInterval); // Stop the round timer
      clearInterval(this.voteTimerInterval); // Stop the voting timer

      // Show the winner and give the host the option to start a new game
      this.showWinner = true;  // Set the flag to show the winner screen
    });

    // Push subscriptions into the array to manage them properly
    this.subscriptions.push(sub1, sub2, sub3, sub4);
  }

  // Start a new game (called by host)
  startNewGame() {
    if (this.isHost) {
      this.socketService.playAgain(this.roomCode); // Trigger a new game round
      this.showWinner = false;  // Hide the winner screen and start new game
    }
  }

  // Submitting a response
  submitResponse() {
    if (!this.responseSubmitted) {
      this.socketService.submitResponse(this.roomCode, this.responseText);
      this.responseText = '';
      this.responseSubmitted = true; // Mark response as submitted
    }
  }

  // Start the voting timer
  startVotingTimer() {
    if (this.voteTimerInterval) {
      clearInterval(this.voteTimerInterval); // Clear any previous voting timer
    }
    this.voteTimeLeft = 30; // Reset voting timer
    this.voteTimerInterval = setInterval(() => {
      if (this.voteTimeLeft > 0) {
        this.voteTimeLeft--;
      } else {
        clearInterval(this.voteTimerInterval); // Stop the timer when time is up
        this.socketService.voteTimeout(this.roomCode); // Notify server that time is up
      }
    }, 1000); // Update every second
  }

  // Submit the vote
  submitVote() {
    this.socketService.vote(this.roomCode, this.selectedVote);
    this.selectedVote = '';
    this.voteSubmitted = true;
    clearInterval(this.voteTimerInterval); // Stop the voting timer after vote is cast
  }

  // Restart the game state for a new prompt
  resetGameState() {
    this.responseSubmitted = false;
    this.responseList = [];
    this.voting = false;
    this.voteSubmitted = false;
    this.winner = '';
    this.showWinner = false;
    this.voteTimeLeft = 30;
    this.timeLeft = 60;
  }

  // Start the round timer
  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval); // Clear any previous timer
    }
    this.timeLeft = 60; // Reset timer
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval); // Stop timer when time is up
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.timerInterval) {
      clearInterval(this.timerInterval); // Clear round timer when leaving the component
    }
    if (this.voteTimerInterval) {
      clearInterval(this.voteTimerInterval); // Clear voting timer when leaving the component
    }
  }
}
