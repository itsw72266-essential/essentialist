import { connectMongo } from "../../db/mongoose.js";
import { getAccessTokenFromRequest } from "../../lib/authFromRequest.js";
import { verifyAccessToken } from "../../lib/jwtTokens.js";
import UserModel from "../../models/user.model.js";

export async function logoutUserAction(request) {
  let userId = null;
  const token = getAccessTokenFromRequest(request);
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      userId = decoded?.id;
    } catch {
      /* optional: still return success like clearing session */
    }
  }

  await connectMongo();

  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });
  }

  return {
    status: 200,
    body: {
      message: "Logout successful",
      error: false,
      success: true,
    },
  };
}
