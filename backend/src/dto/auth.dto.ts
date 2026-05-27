import { User } from "@prisma/client";

export interface AccessTokenPayloadDTO {
  id: number;
  email: string;
  roles: string[];
  name: string;
  restauranteId: number;
}

export const toTokenPayload = (
  user: Pick<User, "id" | "email" | "name">,
  roles: string[],
  restauranteId: number
): AccessTokenPayloadDTO => ({
  id: user.id,
  email: user.email,
  roles,
  name: user.name,
  restauranteId,
});
