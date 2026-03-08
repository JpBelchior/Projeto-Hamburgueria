// context/request-context.ts
import { AsyncLocalStorage } from "async_hooks";
import { AccessTokenPayloadDTO } from "../../dto/auth.dto";

interface RequestContext {
  user?: AccessTokenPayloadDTO;
  requestId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const RequestContext = {
  run: (ctx: RequestContext, fn: () => void) => storage.run(ctx, fn),
  get: (): RequestContext | undefined => storage.getStore(),
  getUser: (): AccessTokenPayloadDTO | undefined => storage.getStore()?.user,
};