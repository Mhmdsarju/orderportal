import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";

const protoPath = path.resolve(__dirname, "../../proto/user.proto");

const definition = protoLoader.loadSync(protoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

interface UserServiceClient {
  getUserMe(
    request: { userId: string },
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: UserResponse) => void,
  ): void;
}

type UserServiceClientConstructor = new (
  address: string,
  credentials: grpc.ChannelCredentials,
) => UserServiceClient;
const loaded = grpc.loadPackageDefinition(definition) as unknown as {
  user: { UserService: UserServiceClientConstructor };
};

interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const target = process.env.USER_SERVICE_GRPC_URL ?? "localhost:50051";

const client = new loaded.user.UserService(
  target,
  grpc.credentials.createInsecure(),
) as UserServiceClient;
export function getUserMe(
  userId: string,
  token: string,
): Promise<UserResponse> {
  return new Promise((resolve, reject) => {
    const metadata = new grpc.Metadata();
    metadata.add("authorization", `Bearer ${token}`);
    client.getUserMe({ userId }, metadata, (error, response) =>
      error ? reject(error) : resolve(response),
    );
  });
}
