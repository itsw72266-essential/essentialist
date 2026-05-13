import bcryptjs from "bcryptjs";

import { connectMongo } from "../../db/mongoose.js";
import { hashRefreshToken } from "../../lib/hashRefreshToken.js";
import {
  mergeGuestAddresses,
  mergeGuestCart,
  mergeGuestOrders,
} from "../../lib/guestMerge.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../../lib/jwtTokens.js";
import UserModel from "../../models/user.model.js";
import { loginSchema } from "../../schemas/auth.schema.js";

export async function loginUserAction(input) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        message: "Invalid input",
        error: true,
        success: false,
        details: parsed.error.issues.map((i) => i.message),
      },
    };
  }

  const {
    email,
    password,
    guestCart,
    guestAddresses,
    guestOrders = [],
  } = parsed.data;

  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return {
      status: 400,
      body: {
        message: "Invalid email or password",
        error: true,
        success: false,
      },
    };
  }

  if (user.status !== "Active") {
    return {
      status: 403,
      body: {
        message: "Account disabled. Contact support.",
        error: true,
        success: false,
      },
    };
  }

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    return {
      status: 400,
      body: {
        message: "Invalid email or password",
        error: true,
        success: false,
      },
    };
  }

  await mergeGuestCart(user._id, guestCart);
  await mergeGuestAddresses(user._id, guestAddresses);
  const mergedGuestOrders = await mergeGuestOrders(user, guestOrders);

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  const hashedRefresh = await hashRefreshToken(refreshToken);

  await UserModel.findByIdAndUpdate(user._id, {
    last_login_date: new Date(),
    refresh_token: hashedRefresh,
  });

  return {
    status: 200,
    body: {
      message: "Login successful",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
        mergedGuestOrders,
      },
    },
  };
}
