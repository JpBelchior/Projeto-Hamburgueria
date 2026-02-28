import { IAuthRepository } from "../../domain/auth.repository";

export class LogoutUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(userId: number) {
    await this.repo.updateRefreshToken(userId, null);
  }
}