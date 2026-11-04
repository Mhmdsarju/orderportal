import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const publicPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/health",
]);

export function verifyGatewayToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {

  if (req.method === "OPTIONS" || publicPaths.has(req.path)) return next();
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ message: "Bearer token required" });
    return;
  }
  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as Express.Request["user"];
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
