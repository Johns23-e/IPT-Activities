import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { UsersComponent } from './pages/admin/users/users';
import { AddUsersComponent } from './pages/admin/add-users/add-users';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    UsersComponent,
    AddUsersComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  isAdmin: boolean = false;
  isLoginSuccessful: boolean = false;

  username: string = '';
  password: string = '';
  result: string = '';

  userList = [
    {
      username: 'admin',
      password: '1234567',
      type: 'admin'
    },
    {
      username: 'user',
      password: '123',
      type: 'user'
    }
  ];

  validateLogin() {

    const userLoggedIn = this.userList.find(user =>
      user.username === this.username &&
      user.password === this.password
    );

    if (userLoggedIn) {
      this.isLoginSuccessful = true;
      this.isAdmin = userLoggedIn.type === 'admin';
      this.result = this.isAdmin ? 'users works!' : 'add-user works!';
    } else {
      this.result = "Invalid Credentials";
      this.isLoginSuccessful = false;
    }
  }
}