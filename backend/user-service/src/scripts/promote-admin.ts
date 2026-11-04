import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
async function main(): Promise<void> {
  const email = process.argv[2]?.toLowerCase().trim();
  if (!email)
    throw new Error("Usage: npm run promote-admin -- user@example.com");
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true },
  );
  if (!user) throw new Error(`User not found: ${email}`);
  console.log(
    `Promoted ${email} to admin. Ask the user to log in again to receive an admin JWT.`,
  );
  await mongoose.disconnect();
}
main().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
