import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Users } from './pages/admin/users/users';
import { AddUsers } from './pages/admin/add-users/add-users';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Users, AddUsers],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  isAdmin: boolean = false;
  isLoginSuccessful: boolean = false;
  showSignUp: boolean = false;

  username: string = '';
  password: string = '';
  email: string = '';
  studentId: string = '';
  result: string = '';
  signUpType: 'user' | 'admin' = 'user';

  userList: { username: string; password: string; type: string; email?: string; studentId?: string }[] = [
    { username: 'admin', password: '1234567', type: 'admin' },
    { username: 'user', password: '123', type: 'user' }
  ];

  validateLogin() {
    const userLoggedIn = this.userList.find(user =>
      user.username === this.username &&
      user.password === this.password
    );

    if (userLoggedIn) {
      this.isLoginSuccessful = true;
      this.isAdmin = userLoggedIn.type === 'admin';
      this.result = '';
    } else {
      this.result = "Invalid Credentials";
      this.isLoginSuccessful = false;
    }
  }

  signUp() {
    if (!this.username.trim() || !this.password.trim()) {
      this.result = "Please enter username and password";
      return;
    }
    if (!this.email.trim()) {
      this.result = "Please enter email";
      return;
    }
    if (!this.studentId.trim()) {
      this.result = "Please enter Student ID";
      return;
    }
    const exists = this.userList.find(u => u.username === this.username);
    if (exists) {
      this.result = "Username already exists";
      return;
    }
    const existsStudentId = this.userList.find(u => u.studentId === this.studentId);
    if (existsStudentId) {
      this.result = "Student ID already registered";
      return;
    }
    this.userList.push({
      username: this.username,
      password: this.password,
      type: this.signUpType,
      email: this.email.trim(),
      studentId: this.studentId.trim()
    });
    this.result = "Sign up successful! You can now log in.";
    this.showSignUp = false;
    this.email = '';
    this.studentId = '';
    this.signUpType = 'user';
  }

  logout() {
    this.isLoginSuccessful = false;
    this.isAdmin = false;
    this.result = '';
  }
}