export interface UserProps {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: string;
  email: string;
  password: string;
}

export interface UpdateUserProps {
  email?: string;
  password?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface UserJSON {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly isActive: boolean;
  public readonly lastLoginAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.isActive = props.isActive;
    this.lastLoginAt = props.lastLoginAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.length === 0) {
      throw new Error("User ID is required");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error("User email is invalid");
    }

    if (!this.password || this.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static create(props: CreateUserProps): User {
    const now = new Date();

    return new User({
      id: props.id,
      email: props.email,
      password: props.password,
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateLastLogin(): User {
    return new User({
      id: this.id,
      email: this.email,
      password: this.password,
      isActive: this.isActive,
      lastLoginAt: new Date(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  updatePassword(newPassword: string): User {
    return new User({
      id: this.id,
      email: this.email,
      password: newPassword,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  deactivate(): User {
    return new User({
      id: this.id,
      email: this.email,
      password: this.password,
      isActive: false,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  toJSON(): UserJSON {
    return {
      id: this.id,
      email: this.email,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  toJSONWithPassword(): UserJSON & { password: string } {
    return {
      ...this.toJSON(),
      password: this.password,
    };
  }
}