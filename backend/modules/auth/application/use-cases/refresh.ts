import { IAuthRepository } from "../../domain/auth.repository";
import { toTokenPayload } from "../dtos/auth.dto";
import { generateAccessToken, verifyRefreshToken } from "../../infra/jwt.helper";

export class RefreshUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken); // lança se inválido

    const user = await this.repo.findById(decoded.id);

    if (!user || !user.active || user.refreshToken !== refreshToken) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    const newAccessToken = generateAccessToken(toTokenPayload(user));
    return { token: newAccessToken, expiresIn: 30 * 60 };
  }
}