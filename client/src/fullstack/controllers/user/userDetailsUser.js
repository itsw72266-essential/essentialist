import { connectMongo } from "../../db/mongoose.js";
import { getAccessTokenFromRequest } from "../../lib/authFromRequest.js";
import { verifyAccessToken } from "../../lib/jwtTokens.js";
import UserModel from "../../models/user.model.js";

export async function userDetailsAction(request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return {
      status: 401,
      body: {
        message: "Provide token",
        error: true,
        success: false,
      },
    };
  }

  let userId;
  try {
    const decoded = verifyAccessToken(token);
    userId = decoded.id;
  } catch {
    return {
      status: 401,
      body: {
        message: "unauthorized access",
        error: true,
        success: false,
      },
    };
  }

  await connectMongo();

  const user = await UserModel.findById(userId)
    .select("-password -refresh_token -forgot_password_otp -forgot_password_expiry")
    .lean();

  return {
    status: 200,
    body: {
      message: "User details",
      data: user,
      error: false,
      success: true,
    },
  };
}
