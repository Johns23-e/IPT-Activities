import type { UserRole, usersModel } from './usersModel';

// ===== Value objects (Composition) =====
export class ContactInfo {
  constructor(private readonly phoneNumber: string) {}

  get value(): string {
    return this.phoneNumber;
  }

  public matches(query: string): boolean {
    return this.phoneNumber.toLowerCase().includes(query.toLowerCase());
  }
}

export class Address {
  constructor(private readonly addressLine: string) {}

  get value(): string {
    return this.addressLine;
  }

  public matches(query: string): boolean {
    return this.addressLine.toLowerCase().includes(query.toLowerCase());
  }
}

// ===== Aggregated object =====
export class Tag {
  constructor(public readonly name: string) {}
}

// ===== Abstraction: base entity =====
export abstract class UserEntity {
  // Encapsulation: fields are private; access via getters.
  private readonly id_: number;
  private username_: string;
  private email_: string;
  private password_: string;

  // Composition: user owns these value objects.
  private contactInfo_: ContactInfo;
  private address_: Address;

  // Aggregation: tags are referenced as objects (not value-owned semantics).
  private readonly tags_: Tag[];

  // Association: user is related to a role concept.
  protected readonly role_: UserRole;

  protected constructor(id: number, input: usersModel, tags: Tag[] = []) {
    this.id_ = id;
    this.username_ = input.username;
    this.email_ = input.email;
    this.password_ = input.password;
    this.contactInfo_ = new ContactInfo(input.phoneNumber);
    this.address_ = new Address(input.address);
    this.tags_ = tags;
    this.role_ = input.role;
  }

  get id(): number {
    return this.id_;
  }

  get username(): string {
    return this.username_;
  }

  get email(): string {
    return this.email_;
  }

  get phoneNumber(): string {
    return this.contactInfo_.value;
  }

  get address(): string {
    return this.address_.value;
  }

  get role(): UserRole {
    return this.role_;
  }

  get roleLabel(): string {
    return this.role_ === 'student' ? 'Student' : 'Instructor';
  }

  public matches(query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      this.username_.toLowerCase().includes(q) ||
      this.email_.toLowerCase().includes(q) ||
      this.phoneNumber.toLowerCase().includes(q) ||
      this.address_.value.toLowerCase().includes(q)
    );
  }

  public toTableRow(): usersModel {
    // Used by the UI to avoid direct access to private fields.
    return {
      id: this.id_,
      username: this.username_,
      email: this.email_,
      phoneNumber: this.phoneNumber,
      address: this.address,
      role: this.role_,
      password: this.password_,
    };
  }

  // ===== Polymorphism: validation differs by subclass =====
  public abstract validate(): string[];

  // Update base properties by mutating this entity (encapsulation still applies).
  // Role changes should typically recreate entities via the factory.
  public updateProfile(input: usersModel): void {
    this.username_ = input.username;
    this.email_ = input.email;
    this.password_ = input.password;
    // Composition: recreate value objects so invariants stay consistent.
    this.contactInfo_ = new ContactInfo(input.phoneNumber);
    this.address_ = new Address(input.address);
  }
}

export class StudentUserEntity extends UserEntity {
  constructor(id: number, input: usersModel, tags: Tag[] = []) {
    super(id, { ...input, role: 'student' }, tags);
  }

  public override validate(): string[] {
    const errors: string[] = [];
    if (!this.username.trim()) errors.push('Username is required.');
    if (!/^\S+@\S+\.\S+$/.test(this.email)) errors.push('Email format is invalid.');
    if (!/^\+?\d{7,15}$/.test(this.phoneNumber)) errors.push('Phone number format is invalid.');
    // Student-specific password rule (polymorphism).
    if (this.toTableRow().password.length < 5 || this.toTableRow().password.length > 8) {
      errors.push('Student password must be 5 to 8 characters.');
    }
    return errors;
  }
}

export class InstructorUserEntity extends UserEntity {
  constructor(id: number, input: usersModel, tags: Tag[] = []) {
    super(id, { ...input, role: 'instructor' }, tags);
  }

  public override validate(): string[] {
    const errors: string[] = [];
    if (!this.username.trim()) errors.push('Username is required.');
    if (!/^\S+@\S+\.\S+$/.test(this.email)) errors.push('Email format is invalid.');
    if (!/^\+?\d{7,15}$/.test(this.phoneNumber)) errors.push('Phone number format is invalid.');
    // Instructor-specific password rule (polymorphism).
    if (this.toTableRow().password.length < 6 || this.toTableRow().password.length > 12) {
      errors.push('Instructor password must be 6 to 12 characters.');
    }
    return errors;
  }
}

