import { Schema, model, type HydratedDocument } from "mongoose";
export type UserRole = "user" | "admin";
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}
export type UserDocument = HydratedDocument<IUser>;
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
export const User = model<IUser>("User", userSchema);
