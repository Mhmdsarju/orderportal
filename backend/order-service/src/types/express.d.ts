import "express";
export interface JwtUser {
  userId: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}
declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
