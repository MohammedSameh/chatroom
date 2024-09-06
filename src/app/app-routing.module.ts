import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { GameComponent } from './components/game/game.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chatroom/:roomCode', component: ChatroomComponent },
  { path: 'game/:roomCode', component: GameComponent },
  { path: '**', redirectTo: '' } // Redirect unknown paths to Home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
