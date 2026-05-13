import bcryptjs from "bcryptjs";

import { connectMongo } from "../../db/mongoose.js";
import { getBearerToken } from "../../lib/authFromRequest.js";
import { verifyAccessToken } from "../../lib/jwtTokens.js";
import UserModel from "../../models/user.model.js";
import { updateUserSchema } from "../../schemas/auth.schema.js";

export async function updateUserAction(request, input) {
  const token = getBearerToken(request);
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

  const parsed = updateUserSchema.safeParse(input);
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

  const { name, email, mobile, password } = parsed.data;
  const updates = {};

  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (mobile) updates.mobile = mobile.trim();

  if (password) {
    const salt = await bcryptjs.genSalt(10);
    updates.password = await bcryptjs.hash(password, salt);
  }

  if (!Object.keys(updates).length) {
    return {
      status: 400,
      body: {
        message: "No fields to update",
        error: true,
        success: false,
      },
    };
  }

  await connectMongo();
  await UserModel.updateOne({ _id: userId }, updates);

  return {
    status: 200,
    body: {
      message: "Profile updated successfully",
      error: false,
      success: true,
    },
  };
}
