import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
const protoPath = path.resolve(__dirname, "../../proto/user.proto");
const definition = protoLoader.loadSync(protoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
type UserServiceDefinition = { service: grpc.ServiceDefinition };
const loaded = grpc.loadPackageDefinition(definition) as unknown as {
  user: { UserService: UserServiceDefinition };
};
interface GetUserMeRequest {
  userId: string;
}
interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
}
interface JwtPayload {
  userId: string;
  role: "user" | "admin";
}
function makeGrpcError(
  code: grpc.ServiceError["code"],
  message: string,
): grpc.ServiceError {
  const error = new Error(message) as grpc.ServiceError;
  error.code = code;
  error.details = message;
  error.metadata = new grpc.Metadata();
  return error;
}
async function getUserMe(
  call: grpc.ServerUnaryCall<GetUserMeRequest, UserResponse>,
  callback: grpc.sendUnaryData<UserResponse>,
): Promise<void> {
  try {
    const auth = call.metadata.get("authorization")[0];
    const header = typeof auth === "string" ? auth : "";
    if (!header.startsWith("Bearer ")) {
      callback(
        makeGrpcError(grpc.status.UNAUTHENTICATED, "Missing bearer token"),
      );
      return;
    }
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    if (payload.userId !== call.request.userId) {
      callback(
        makeGrpcError(grpc.status.PERMISSION_DENIED, "User identity mismatch"),
      );
      return;
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      callback(makeGrpcError(grpc.status.NOT_FOUND, "User not found"));
      return;
    }
    callback(null, {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    callback(
      makeGrpcError(grpc.status.UNAUTHENTICATED, "Authentication failed"),
    );
  }
}
export function startGrpcServer(): grpc.Server {
  const server = new grpc.Server();
  server.addService(loaded.user.UserService.service, { getUserMe });
  const address = `0.0.0.0:${process.env.GRPC_PORT ?? 50051}`;
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) throw error;
      server.start();
      console.log(`User Service gRPC listening on ${port}`);
    },
  );
  return server;
}
