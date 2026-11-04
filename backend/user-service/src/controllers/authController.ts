import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
function signToken(userId: string, role: "user" | "admin"): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign({ userId, role }, secret, { expiresIn: "24h" });
}
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (
    !name?.trim() ||
    !email ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !password ||
    password.length < 8
  ) {
    res
      .status(400)
      .json({
        message:
          "Valid name, email and password (minimum 8 characters) are required",
      });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });
  const userId = user._id.toString();
  res
    .status(201)
    .json({
      token: signToken(userId, user.role),
      user: { userId, name: user.name, email: user.email, role: user.role },
    });
}
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const userId = user._id.toString();
  res.json({
    token: signToken(userId, user.role),
    user: { userId, name: user.name, email: user.email, role: user.role },
  });
}
