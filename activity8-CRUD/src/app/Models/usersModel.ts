export type UserRole = 'student' | 'instructor';

// Data used by the UI form and CRUD service.
// (The OOP entity classes live in `userEntity.ts`.)
export interface usersModel {
  id?: number;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  password: string;
}