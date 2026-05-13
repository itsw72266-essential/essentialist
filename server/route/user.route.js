
import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshToken,
  registerUserController,
  resetpassword,
  updateUserDetails,
  uploadAvatar,
  userDetails,
  verifyEmailController,
  verifyForgotPasswordOtp,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";

const userRouter = Router();

userRouter.post(
  "/register",
  validateRequest(registerSchema),
  registerUserController
);
userRouter.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  verifyEmailController
);
userRouter.post("/login", validateRequest(loginSchema), loginController);
userRouter.get("/logout", auth, logoutController);
userRouter.put(
  "/upload-avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);
userRouter.put("/update-user", auth, updateUserDetails);
userRouter.put(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPasswordController
);
userRouter.put(
  "/verify-forgot-password-otp",
  validateRequest(verifyForgotOtpSchema),
  verifyForgotPasswordOtp
);
userRouter.put(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetpassword
);
userRouter.post("/refresh-token", refreshToken);
userRouter.get("/user-details", auth, userDetails);

export default userRouter;