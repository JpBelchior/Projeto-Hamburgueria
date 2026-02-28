import { PrismaClient, User } from "@prisma/client";
import { IAuthRepository } from "../domain/auth.repository";

const prisma = new PrismaClient();

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateRefreshToken(id: number, token: string | null): Promise<void> {
    await prisma.user.update({ where: { id }, data: { refreshToken: token } });
  }
}