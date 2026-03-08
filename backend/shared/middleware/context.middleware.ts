// middleware/context.middleware.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { RequestContext } from "../context/request-context";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  RequestContext.run(
    {
      user: req.user,          // já populado pelo authenticate
      requestId: randomUUID(), // útil para rastrear logs
    },
    next
  );
};