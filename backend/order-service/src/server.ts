import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import app from "./app";
import prisma from "./config/prisma";

const port = Number(process.env.PORT ?? 4002);

async function bootstrap(): Promise<void> {

  if (!process.env.JWT_SECRET || !process.env.DATABASE_URL)
    throw new Error("JWT_SECRET and DATABASE_URL are required");
  await prisma.$connect();
  app.listen(port, "0.0.0.0", () =>
    console.log(`Order Service listening on ${port}`),
  );
}
bootstrap().catch((error: unknown) => {
  console.error("Order Service startup failed:", error);
  process.exit(1);
});
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
