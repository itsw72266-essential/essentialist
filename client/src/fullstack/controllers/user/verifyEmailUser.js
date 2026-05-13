import { connectMongo } from "../../db/mongoose.js";
import UserModel from "../../models/user.model.js";
import { verifyEmailSchema } from "../../schemas/auth.schema.js";

export async function verifyEmailUserAction(input) {
  const parsed = verifyEmailSchema.safeParse(input);
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

  const { code } = parsed.data;
  await connectMongo();

  const user = await UserModel.findById(code);
  if (!user) {
    return {
      status: 400,
      body: {
        message: "Invalid or expired verification code",
        error: true,
        success: false,
      },
    };
  }

  if (user.verify_email) {
    return {
      status: 200,
      body: {
        message: "Email already verified",
        success: true,
        error: false,
      },
    };
  }

  await UserModel.updateOne({ _id: code }, { verify_email: true });

  return {
    status: 200,
    body: {
      message: "Email verification successful",
      success: true,
      error: false,
    },
  };
}
