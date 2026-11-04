import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import app from "./app";

const port = Number(process.env.PORT ?? process.env.GATEWAY_PORT ?? 3000);

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

app.listen(port, "0.0.0.0", () =>
  console.log(`API Gateway listening on ${port}`),
);
