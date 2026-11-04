import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyGatewayToken } from "./middleware/auth";

const app = express();

app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3098"],
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(morgan(":method :url :status :response-time ms"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests; try again later" },
  }),
);

app.use(verifyGatewayToken);

app.get("/health", (_req, res) => {
  res.json({ service: "api-gateway", status: "ok" });
});

const userTarget = process.env.USER_SERVICE_URL ?? "http://localhost:4001";
const orderTarget = process.env.ORDER_SERVICE_URL ?? "http://localhost:4002";

function rewriteMountedPath(
  path: string,
  gatewayPrefix: string,
  servicePrefix: string,
): string {
  const suffix = path.startsWith(gatewayPrefix)
    ? path.slice(gatewayPrefix.length)
    : path;
  return suffix.startsWith(servicePrefix)
    ? suffix
    : `${servicePrefix}${suffix}`;
}
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: userTarget,
    changeOrigin: true,
    pathRewrite: (path) => rewriteMountedPath(path, "/api/auth", "/auth"),
  }),
);
app.use(
  "/api/users",
  createProxyMiddleware({
    target: userTarget,
    changeOrigin: true,
    pathRewrite: (path) => rewriteMountedPath(path, "/api/users", "/users"),
  }),
);
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: orderTarget,
    changeOrigin: true,
    pathRewrite: (path) => rewriteMountedPath(path, "/api/orders", "/orders"),
  }),
);
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(502).json({ message: "Upstream service unavailable" });
};
app.use(errorHandler);
export default app;
