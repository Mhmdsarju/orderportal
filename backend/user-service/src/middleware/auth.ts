import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtUser } from "../types/express";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUser;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function adminOnly(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}
