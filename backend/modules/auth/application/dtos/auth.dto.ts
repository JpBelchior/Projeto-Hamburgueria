import { Role, User } from "@prisma/client";

export interface AccessTokenPayloadDTO {
  id: number;
  email: string;
  role: Role;
  name: string;
}

export const toTokenPayload = (
  user: Pick<User, "id" | "email" | "role" | "name">
): AccessTokenPayloadDTO => ({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
});