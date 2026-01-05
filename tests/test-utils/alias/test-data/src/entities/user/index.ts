export interface User {
  id: string;
  name: string;
  email: string;
}

export function createUser(name: string, email: string): User {
  return {
    id: Math.random().toString(36).substring(7),
    name,
    email,
  };
}

export class UserEntity {
  constructor(private user: User) {}

  getId(): string {
    return this.user.id;
  }

  getName(): string {
    return this.user.name;
  }

  getEmail(): string {
    return this.user.email;
  }
}

