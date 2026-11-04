import "express-async-errors";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3098"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_req, res) => {
  res.json({ service: "order-service", status: "ok" });
});
app.use("/orders", orderRoutes);
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
app.use(errorHandler);
export default app;
