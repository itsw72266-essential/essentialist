import bcryptjs from "bcryptjs";

import sendEmail from "../../config/sendEmail.js";
import { connectMongo } from "../../db/mongoose.js";
import { getPublicSiteUrl } from "../../lib/publicSiteUrl.js";
import UserModel from "../../models/user.model.js";
import { registerSchema } from "../../schemas/auth.schema.js";
import verifyEmailTemplate from "../../templates/verifyEmailTemplate.js";

function sanitizeUser(userDoc) {
  const safe = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete safe.password;
  delete safe.refresh_token;
  delete safe.forgot_password_otp;
  delete safe.forgot_password_expiry;
  return safe;
}

/**
 * Next-native registration (same DB as Express). Response shape matches Express JSON.
 *
 * @param {unknown} input
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function registerUserAction(input) {
  const parsed = registerSchema.safeParse(input);
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

  const { name, email, password } = parsed.data;

  await connectMongo();

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return {
      status: 409,
      body: {
        message: "Email already registered",
        error: true,
        success: false,
      },
    };
  }

  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(password, salt);

  let newUser;
  try {
    newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return {
        status: 409,
        body: {
          message: "Email already registered",
          error: true,
          success: false,
        },
      };
    }
    throw err;
  }

  const site = getPublicSiteUrl();
  const verifyUrl = `${site}/verify-email?code=${newUser._id}`;

  await sendEmail({
    sendTo: email,
    subject: "Verify email from Essentialist Makeup Store",
    html: verifyEmailTemplate({ name, url: verifyUrl }),
  });

  return {
    status: 201,
    body: {
      message: "User registered successfully",
      error: false,
      success: true,
      data: sanitizeUser(newUser),
    },
  };
}
