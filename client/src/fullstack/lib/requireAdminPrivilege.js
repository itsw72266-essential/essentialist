import { connectMongo } from "../db/mongoose.js";
import UserModel from "../models/user.model.js";
import { resolveAuthUserId } from "./resolveAuthUserId.js";

/** Matches Express `adminOnly`: ADMIN or SUPER_ADMIN. */
export async function requireAdminPrivilege(nextRequest) {
  const auth = resolveAuthUserId(nextRequest, { required: true });
  if (auth.error) return auth;

  await connectMongo();
  const user = await UserModel.findById(auth.userId).select("role").lean();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return {
      error: {
        status: 403,
        body: {
          success: false,
          error: true,
          message: "Admin privilege required",
        },
      },
    };
  }

  return { userId: auth.userId, requestUser: user };
}
