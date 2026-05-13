import bcryptjs from "bcryptjs";

import { connectMongo } from "../../db/mongoose.js";
import UserModel from "../../models/user.model.js";
import { resetPasswordSchema } from "../../schemas/auth.schema.js";

export async function resetPasswordUserAction(input) {
  const parsed = resetPasswordSchema.safeParse(input);
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

  const { email, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return {
      status: 400,
      body: {
        message: "Passwords do not match",
        error: true,
        success: false,
      },
    };
  }

  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return {
      status: 400,
      body: {
        message: "Invalid request",
        error: true,
        success: false,
      },
    };
  }

  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(newPassword, salt);

  await UserModel.findByIdAndUpdate(user._id, {
    password: hashPassword,
    forgot_password_otp: "",
    forgot_password_expiry: null,
  });

  return {
    status: 200,
    body: {
      message: "Password updated successfully",
      error: false,
      success: true,
    },
  };
}
