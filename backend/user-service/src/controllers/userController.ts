import type { Request, Response } from "express";
import { User } from "../models/User";
function toSafeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(toSafeUser(user));
}
export async function byId(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(toSafeUser(user));
}
