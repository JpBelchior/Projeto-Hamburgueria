import { AccessTokenPayloadDTO } from "../dtos/auth.dto";

export class MeUseCase {
  execute(user: AccessTokenPayloadDTO) {
    return { user };
  }
}