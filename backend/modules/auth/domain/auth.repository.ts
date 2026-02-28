import { User } from "@prisma/client";

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  updateRefreshToken(id: number, token: string | null): Promise<void>;
}