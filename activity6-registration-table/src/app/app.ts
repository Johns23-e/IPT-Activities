import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {usersModel} from './Models/usersModel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  protected readonly title = signal('login');

  isLogin: boolean = true;

  email: string = '';
  password: string = '';
  usernameReg: string = '';
  emailReg: string = '';

  regEmail: string = '';
  regPassword: string = '';
  role: string = 'student';

  message: string = '';

  students: any[] = [];
  instructors: any[] = [];
  newuserList: usersModel[]=[];
  hasValidated: boolean = false;

  switchForm(){
    this.isLogin = !this.isLogin;
    this.message = '';
  }

  register(){
    if(!this.regEmail || !this.regPassword){
      this.message = "Fill all fields";
      return;
    }
    this.hasValidated = true;
    const newUser = {
      username: this.usernameReg,
      email: this.regEmail,
      password: this.regPassword
    };
    this.message = "Registration successful";
    this.loadTableValues();
  }

  Validate(){
    if(!this.email && !this.password){
      this.message = "Empty email and password";
      return;
    }
    if(!this.email){
      this.message = "Empty email";
      return;
    }
    if(!this.password){
      this.message = "Empty password";
      return;
    }
    const student = this.students.find(
      u => u.email === this.email && u.password === this.password
    );
    const instructor = this.instructors.find(
      u => u.email === this.email && u.password === this.password
    );
    if(student){
      this.message = "Logged in as Student";
    }
    else if(instructor){
      this.message = "Logged in as Instructor";
    }
    else{
      this.message = "Invalid credentials";
    }
  }
  loadTableValues(){
    const newUser: usersModel = {
      username: this.usernameReg,
      email: this.regEmail,
      password: this.regPassword,
    }
    this.newuserList.push(newUser);
  }
}