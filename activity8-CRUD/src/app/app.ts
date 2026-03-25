import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { UserRole, usersModel } from './Models/usersModel';
import type { UserEntity } from './Models/userEntity';
import { User } from './user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  public isLogin = true;
  public heading = 'User Management';

  private fb = inject(FormBuilder);
  private userService = inject(User);

  public loginForm = this.fb.group({
    usernameOrEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  public submittedLogin = false;

  public users: UserEntity[] = [];
  public filteredUsers: UserEntity[] = [];

  public searchQuery = '';
  public selectedUserId: number | null = null;

  public errors: string[] = [];
  public message = '';

  public userForm = this.fb.group({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    role: new FormControl<UserRole>('student' as UserRole, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // For this activity we store the password in-memory so updates can re-use it.
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(12)],
    }),
  });

  constructor() {
    this.refreshTable();
  }

  private get formValue(): usersModel {
    return this.userForm.getRawValue();
  }

  public switchForm(): void {
    this.isLogin = !this.isLogin;
    this.errors = [];
    this.message = '';
    this.submittedLogin = false;

    this.loginForm.reset({
      usernameOrEmail: '',
      password: '',
    });

    // Keep registration data clean when switching views.
    this.onClear();
  }

  public Validate(): void {
    this.submittedLogin = true;
    this.errors = [];
    this.message = '';

    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      this.message = 'Invalid login credentials.';
      return;
    }

    const usernameOrEmail = this.loginForm.get('usernameOrEmail')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    const found = this.userService
      .listUsers()
      .find((u) => {
        const row = u.toTableRow();
        return (row.username === usernameOrEmail || row.email === usernameOrEmail) && row.password === password;
      });

    if (!found) {
      this.message = 'Invalid username/email or password.';
      return;
    }

    this.message = `Logged in as ${found.roleLabel}`;
    this.isLogin = false;
  }

  private refreshTable(): void {
    this.users = this.userService.listUsers();
    this.filteredUsers = this.searchQuery.trim()
      ? this.userService.searchUsers(this.searchQuery)
      : [...this.users];
  }

  public onSearch(): void {
    this.refreshTable();
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery = target?.value ?? '';
    this.refreshTable();
  }

  public onClear(): void {
    this.errors = [];
    this.message = '';
    this.selectedUserId = null;
    this.userForm.reset({
      username: '',
      email: '',
      phoneNumber: '',
      address: '',
      role: 'student',
      password: '',
    });
  }

  public onEdit(user: UserEntity): void {
    this.errors = [];
    this.message = '';
    this.selectedUserId = user.id;

    const row = user.toTableRow();
    this.userForm.patchValue({
      username: row.username,
      email: row.email,
      phoneNumber: row.phoneNumber,
      address: row.address,
      role: row.role,
      password: row.password,
    });
  }

  private markTouchedAndValidate(): boolean {
    this.errors = [];
    this.userForm.markAllAsTouched();
    return this.userForm.valid;
  }

  public onCreate(): void {
    this.message = '';
    if (!this.markTouchedAndValidate()) {
      this.errors = ['Please fix errors in the form.'];
      return;
    }

    const result = this.userService.createUser(this.formValue);
    if (result.errors.length) {
      this.errors = result.errors;
      return;
    }

    this.message = 'User created successfully.';
    this.onClear();
    this.refreshTable();
  }

  public onUpdate(): void {
    this.message = '';
    if (this.selectedUserId == null) return;

    if (!this.markTouchedAndValidate()) {
      this.errors = ['Please fix errors in the form.'];
      return;
    }

    const result = this.userService.updateUser(this.selectedUserId, this.formValue);
    if (result.errors.length) {
      this.errors = result.errors;
      return;
    }

    this.message = 'User updated successfully.';
    this.onClear();
    this.refreshTable();
  }

  public onDelete(id: number): void {
    this.errors = [];
    this.message = '';
    this.userService.deleteUser(id);

    if (this.selectedUserId === id) {
      this.selectedUserId = null;
    }
    this.refreshTable();
    this.onClear();
    this.message = 'User deleted successfully.';
  }
}
