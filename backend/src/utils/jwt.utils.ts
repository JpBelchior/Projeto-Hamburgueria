import jwt from "jsonwebtoken";
import { AccessTokenPayloadDTO } from "../dto/auth.dto";

export const generateAccessToken = (payload: AccessTokenPayloadDTO): string => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "30m" });
};

export const generateRefreshToken = (userId: number): string => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): AccessTokenPayloadDTO => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as AccessTokenPayloadDTO;
};

export const verifyRefreshToken = (token: string): { id: number } => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, secret) as { id: number };
};
