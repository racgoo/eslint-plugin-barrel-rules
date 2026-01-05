import { User } from "./index";

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

