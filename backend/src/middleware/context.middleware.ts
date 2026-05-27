import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { RequestContext } from "../utils/request-context";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  RequestContext.run(
    {
      user: req.user,
      requestId: randomUUID(),
      restauranteId: req.user?.restauranteId,
    },
    next
  );
};
