// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private SERVER_URL = 'http://localhost:3000'; // Adjust if different

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  // Emitters
  createRoom(callback: Function) {
    this.socket.emit('createRoom', (response: any) => {
      callback(response);
    });
  }

  joinRoom(roomCode: string, username: string, callback: Function) {
    this.socket.emit('joinRoom', { roomCode, username }, (response: any) => {
      callback(response);
    });
  }

  startGame(roomCode: string) {
    this.socket.emit('startGame', roomCode);
  }

  submitResponse(roomCode: string, response: string) {
    this.socket.emit('submitResponse', { roomCode, response });
  }

  vote(roomCode: string, votedUserId: string) {
    this.socket.emit('vote', { roomCode, votedUserId });
  }

  // Listeners
  onUpdateUsers(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('updateUsers', (users) => {
        observer.next(users);
      });
    });
  }


  onGameStarted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('gameStarted', () => {
        observer.next();
      });
    });
  }

  onNewPrompt(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newPrompt', (data) => {
        observer.next(data);
      });
    });
  }

  onShowResponses(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('showResponses', (responses) => {
        observer.next(responses);
      });
    });
  }

  onRoundWinner(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('roundWinner', (data) => {
        observer.next(data);
      });
    });
  }

  // Add more listeners as needed

  onPlayAgainRequest(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('askToPlayAgain', (data) => {
        observer.next(data);
      });
    });
  }

  playAgain(roomCode: string) {
    this.socket.emit('playAgain', roomCode); // Emit an event to the server to restart the game
  }

  voteTimeout(roomCode: string) {
    this.socket.emit('voteTimeout', roomCode);
  }

  // Subscribe to start voting event
  onStartVoting(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('startVoting', () => {
        observer.next();
      });
    });
  }

}
