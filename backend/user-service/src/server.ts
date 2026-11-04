import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import app from "./app";
import { connectDB } from "./config/db";
import { startGrpcServer } from "./grpc/server";
const port = Number(process.env.PORT ?? 4001);
async function bootstrap(): Promise<void> {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  await connectDB();
  startGrpcServer();
  app.listen(port, "0.0.0.0", () =>
    console.log(`User Service HTTP listening on ${port}`),
  );
}
bootstrap().catch((error: unknown) => {
  console.error("User Service startup failed:", error);
  process.exit(1);
});
