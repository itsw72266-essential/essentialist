import { connectMongo } from "../../db/mongoose.js";
import UserModel from "../../models/user.model.js";
import { verifyForgotOtpSchema } from "../../schemas/auth.schema.js";

export async function verifyForgotPasswordOtpUserAction(input) {
  const parsed = verifyForgotOtpSchema.safeParse(input);
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

  const { email, otp } = parsed.data;
  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return {
      status: 400,
      body: {
        message: "Invalid OTP or email",
        error: true,
        success: false,
      },
    };
  }

    if (
    !user.forgot_password_otp ||
    !user.forgot_password_expiry ||
    user.forgot_password_expiry.getTime() < Date.now() ||
    String(user.forgot_password_otp) !== String(otp)
  ) {
    return {
      status: 400,
      body: {
        message: "Invalid or expired OTP",
        error: true,
        success: false,
      },
    };
  }

  await UserModel.findByIdAndUpdate(user._id, {
    forgot_password_otp: "",
    forgot_password_expiry: null,
  });

  return {
    status: 200,
    body: {
      message: "OTP verified successfully",
      error: false,
      success: true,
    },
  };
}
