import { connectMongo } from "../db/mongoose.js";
import UserModel from "../models/user.model.js";
import { resolveAuthUserId } from "./resolveAuthUserId.js";

export async function requireAdmin(nextRequest) {
  const auth = resolveAuthUserId(nextRequest, { required: true });
  if (auth.error) return auth;

  await connectMongo();
  const user = await UserModel.findById(auth.userId).select("role").lean();
  if (!user || user.role !== "ADMIN") {
    return {
      error: {
        status: 400,
        body: {
          message: "Permission denial",
          error: true,
          success: false,
        },
      },
    };
  }

  return { userId: auth.userId };
}
