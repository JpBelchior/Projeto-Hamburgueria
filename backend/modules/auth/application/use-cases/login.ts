import bcrypt from "bcryptjs";
import { IAuthRepository } from "../../domain/auth.repository";
import { toTokenPayload } from "../dtos/auth.dto";
import { generateAccessToken, generateRefreshToken } from "../../infra/jwt.helper";

export class LoginUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(email: string, password: string) {
    const user = await this.repo.findByEmail(email);

    if (!user || !user.active) {
      throw new Error("Credenciais inválidas.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Credenciais inválidas.");

    const payload = toTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(user.id);

    await this.repo.updateRefreshToken(user.id, refreshToken);

    return { token: accessToken, refreshToken, expiresIn: 30 * 60, user: payload };
  }
}