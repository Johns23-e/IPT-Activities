import { Injectable } from '@angular/core';
import type { usersModel } from './Models/usersModel';
import { InstructorUserEntity, StudentUserEntity, Tag, type UserEntity } from './Models/userEntity';
interface IUserRepository {
  getAll(): UserEntity[];
  getById(id: number): UserEntity | undefined;
  getNextId(): number;
  insert(user: UserEntity): void;
  replace(user: UserEntity): void;
  delete(id: number): boolean;
}

// Encapsulation + Abstraction: repository hides the storage details.
class InMemoryUserRepository implements IUserRepository {
  private readonly users: UserEntity[] = [];
  private nextId = 1;

  getAll(): UserEntity[] {
    // Return a shallow copy so external callers can't mutate internal array.
    return [...this.users];
  }

  getById(id: number): UserEntity | undefined {
    return this.users.find((u) => u.id === id);
  }

  getNextId(): number {
    return this.nextId++;
  }

  insert(user: UserEntity): void {
    this.users.push(user);
  }

  replace(user: UserEntity): void {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx === -1) return;
    this.users[idx] = user;
  }

  delete(id: number): boolean {
    const before = this.users.length;
    const after = this.users.filter((u) => u.id !== id).length;
    this.users.splice(0, this.users.length, ...this.users.filter((u) => u.id !== id));
    return before !== after;
  }
}

@Injectable({
  providedIn: 'root',
})
export class User {
  private readonly repo: IUserRepository = new InMemoryUserRepository();

  constructor() {
    // Start empty; users will be added via Create.
  }

  private createEntity(id: number, input: usersModel): UserEntity {
    const tags = [new Tag(`${input.role}`)];
    if (input.role === 'instructor') {
      return new InstructorUserEntity(id, input, tags);
    }
    return new StudentUserEntity(id, input, tags);
  }

  public listUsers(): UserEntity[] {
    return this.repo.getAll();
  }

  public searchUsers(query: string): UserEntity[] {
    const q = query.trim();
    if (!q) return this.repo.getAll();
    return this.repo.getAll().filter((u) => u.matches(q));
  }

  public createUser(input: usersModel): { user?: UserEntity; errors: string[] } {
    const id = this.repo.getNextId();
    const candidate = this.createEntity(id, input);
    const errors = candidate.validate();
    if (errors.length > 0) return { errors };
    this.repo.insert(candidate);
    return { user: candidate, errors: [] };
  }

  public updateUser(id: number, input: usersModel): { user?: UserEntity; errors: string[] } {
    const existing = this.repo.getById(id);
    if (!existing) return { errors: ['User not found.'] };

    const candidate = this.createEntity(id, input);
    const errors = candidate.validate();
    if (errors.length > 0) return { errors };

    this.repo.replace(candidate);
    return { user: candidate, errors: [] };
  }

  public deleteUser(id: number): boolean {
    return this.repo.delete(id);
  }
}
