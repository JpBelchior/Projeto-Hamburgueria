import jwt from "jsonwebtoken";
import { AccessTokenPayloadDTO } from "../application/dtos/auth.dto";

export const generateAccessToken = (payload: AccessTokenPayloadDTO): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "30m" });

export const generateRefreshToken = (userId: number): string =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): AccessTokenPayloadDTO =>
  jwt.verify(token, process.env.JWT_SECRET as string) as AccessTokenPayloadDTO;

export const verifyRefreshToken = (token: string): { id: number } =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: number };