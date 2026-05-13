import bcryptjs from "bcryptjs";

import { connectMongo } from "../../db/mongoose.js";
import { hashRefreshToken } from "../../lib/hashRefreshToken.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwtTokens.js";
import UserModel from "../../models/user.model.js";

/**
 * @param {string | null | undefined} token - Bearer refresh JWT or cookie value
 */
export async function refreshTokenUserFromToken(token) {
  if (!token?.trim()) {
    return {
      status: 401,
      body: {
        message: "Refresh token missing",
        error: true,
        success: false,
      },
    };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token.trim());
  } catch {
    return {
      status: 401,
      body: {
        message: "Invalid refresh token",
        error: true,
        success: false,
      },
    };
  }

  await connectMongo();

  const user = await UserModel.findById(decoded?.id);
  if (!user || !user.refresh_token) {
    return {
      status: 401,
      body: {
        message: "Invalid refresh token",
        error: true,
        success: false,
      },
    };
  }

  const matches = await bcryptjs.compare(token.trim(), user.refresh_token);
  if (!matches) {
    return {
      status: 403,
      body: {
        message: "Refresh token mismatch",
        error: true,
        success: false,
      },
    };
  }

  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);
  const hashedRefresh = await hashRefreshToken(newRefreshToken);

  await UserModel.findByIdAndUpdate(user._id, {
    refresh_token: hashedRefresh,
  });

  return {
    status: 200,
    body: {
      message: "Token refreshed",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    },
  };
}
