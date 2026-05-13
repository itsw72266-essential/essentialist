import sendEmail from "../../config/sendEmail.js";
import { connectMongo } from "../../db/mongoose.js";
import generatedOtp from "../../lib/generatedOtp.js";
import UserModel from "../../models/user.model.js";
import { forgotPasswordSchema } from "../../schemas/auth.schema.js";
import forgotPasswordTemplate from "../../templates/forgotPasswordTemplate.js";

export async function forgotPasswordUserAction(input) {
  const parsed = forgotPasswordSchema.safeParse(input);
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

  const { email } = parsed.data;
  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return {
      status: 200,
      body: {
        message: "If the email exists, an OTP has been sent",
        error: false,
        success: true,
      },
    };
  }

  const otp = generatedOtp();
  const expiry = Date.now() + 60 * 60 * 1000;

  await UserModel.findByIdAndUpdate(user._id, {
    forgot_password_otp: String(otp),
    forgot_password_expiry: new Date(expiry),
  });

  await sendEmail({
    sendTo: email,
    subject: "Password reset code",
    html: forgotPasswordTemplate({
      name: user.name,
      otp,
    }),
  });

  return {
    status: 200,
    body: {
      message: "If the email exists, an OTP has been sent",
      error: false,
      success: true,
    },
  };
}
