import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, OnDestroy {
  roomCode: string = '';
  username: string = '';
  users: string[] = [];
  isHost: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode') || '';
    this.username = this.route.snapshot.queryParamMap.get('username') || 'Player';

    // Update users list
    const sub1 = this.socketService.onUpdateUsers().subscribe((users: any) => {
      this.users = users;
      this.isHost = users[0] === this.username; // || users[0] === 'Host';
    });

    // Navigate to game when game starts
    const sub2 = this.socketService.onGameStarted().subscribe(() => {
      localStorage.setItem('isHost', JSON.stringify(this.isHost));
      this.router.navigate(['/game', this.roomCode]);
    });

    this.subscriptions.push(sub1, sub2);
  }

  startGame() {
    this.socketService.startGame(this.roomCode);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
