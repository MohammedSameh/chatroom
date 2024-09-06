import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  joinRoomCode: string = '';
  username: string = '';

  constructor(private socketService: SocketService, private router: Router) { }

  createRoom() {
    this.socketService.createRoom((response: any) => {
      const roomCode = response.roomCode;
      this.router.navigate(['/chatroom', roomCode], { queryParams: { username: 'Host' } });
    });
  }

  joinRoom() {
    if (this.joinRoomCode.length !== 4) {
      alert('Room code must be 4 letters.');
      return;
    }
    if (!this.username) {
      alert('Please enter your name.');
      return;
    }
    this.socketService.joinRoom(this.joinRoomCode.toUpperCase(), this.username, (response: any) => {
      if (response.success) {
        this.router.navigate(['/chatroom', this.joinRoomCode.toUpperCase()], { queryParams: { username: this.username } });
      } else {
        alert(response.message);
      }
    });
  }
}
