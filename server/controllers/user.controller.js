
//D:\EssentialistMakeupStore\server\controllers\user.controller.js
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import AddressModel from "../models/address.model.js";
import OrderModel from "../models/order.model.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import genertedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import generatedOtp from "../utils/generatedOtp.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";

const cookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE_MS) || 1000 * 60 * 60 * 24 * 365, // 1 year
};

const sanitizeUser = (userDoc) => {
  const safe = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete safe.password;
  delete safe.refresh_token;
  delete safe.forgot_password_otp;
  delete safe.forgot_password_expiry;
  return safe;
};

async function hashRefreshToken(token) {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(token, salt);
}

function ensureObjectId(id) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

async function mergeGuestCart(userId, guestCart = []) {
  if (!Array.isArray(guestCart) || !guestCart.length) return;

  const bulk = [];
  for (const item of guestCart) {
    const productId = ensureObjectId(item.productId);
    if (!productId) continue;

    const quantity = Math.min(Math.max(item.quantity || 1, 1), 99);

    bulk.push({
      updateOne: {
        filter: { userId, productId },
        update: {
          $setOnInsert: {
            userId,
            productId,
            quantity,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulk.length) {
    await CartProductModel.bulkWrite(bulk, { ordered: false });
    await UserModel.updateOne(
      { _id: userId },
      {
        $addToSet: {
          shopping_cart: { $each: bulk.map((b) => b.updateOne.filter.productId) },
        },
      }
    );
  }
}

async function mergeGuestAddresses(userId, guestAddresses = []) {
  if (!Array.isArray(guestAddresses) || !guestAddresses.length) return;

  for (const addr of guestAddresses) {
    const shaped = {
      ...addr,
      userId,
    };

    const exists = await AddressModel.findOne({
      userId,
      city: addr.city,
      address_line: addr.address_line,
    }).lean();

    if (exists) continue;

    const created = await AddressModel.create(shaped);
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { address_details: created._id } }
    );
  }
}

async function mergeGuestOrders(userDoc, guestOrders = []) {
  if (!Array.isArray(guestOrders) || !guestOrders.length) return [];

  const orderTokenMap = guestOrders.reduce((map, entry) => {
    if (!entry?.orderId || !entry?.integrityToken) return map;
    map.set(entry.orderId, entry.integrityToken);
    return map;
  }, new Map());

  if (!orderTokenMap.size) return [];

  const candidateOrders = await OrderModel.find({
    orderId: { $in: Array.from(orderTokenMap.keys()) },
    is_guest: true,
  }).select("_id orderId integrityToken userId is_guest contact_info");

  if (!candidateOrders.length) return [];

  const syncedOrderIds = new Set();
  const attachableOrders = [];

  for (const order of candidateOrders) {
    const expectedToken = orderTokenMap.get(order.orderId);
    if (!expectedToken) continue;
    if (!order.integrityToken || expectedToken !== order.integrityToken) continue;

    if (order.userId && order.userId.toString() !== userDoc._id.toString()) {
      continue;
    }

    syncedOrderIds.add(order.orderId);

    if (!order.userId || order.is_guest) {
      attachableOrders.push(order);
    }
  }

  if (attachableOrders.length) {
    const bulkOps = attachableOrders.map((order) => ({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            userId: userDoc._id,
            is_guest: false,
            "contact_info.name": userDoc.name || order.contact_info?.name || "",
            "contact_info.customer_email":
              userDoc.email || order.contact_info?.customer_email || "",
            "contact_info.mobile":
              userDoc.mobile || order.contact_info?.mobile || "",
          },
        },
      },
    }));

    await OrderModel.bulkWrite(bulkOps, { ordered: false });
    await UserModel.updateOne(
      { _id: userDoc._id },
      {
        $addToSet: {
          orderHistory: { $each: attachableOrders.map((order) => order._id) },
        },
      }
    );
  }

  return Array.from(syncedOrderIds);
}

export async function registerUserController(request, response) {
  try {
    const payload =
      request.validated?.body || (await registerSchema.parseAsync(request.body));
    const { name, email, password } = payload;

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return response.status(409).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?code=${newUser._id}`;
    await sendEmail({
      sendTo: email,
      subject: "Verify email from Essentialist Makeup Store",
      html: verifyEmailTemplate({ name, url: verifyUrl }),
    });

    return response.status(201).json({
      message: "User registered successfully",
      error: false,
      success: true,
      data: sanitizeUser(newUser),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(request, response) {
  try {
    const payload =
      request.validated?.body ||
      (await verifyEmailSchema.parseAsync(request.body));
    const { code } = payload;

    const user = await UserModel.findById(code);
    if (!user) {
      return response.status(400).json({
        message: "Invalid or expired verification code",
        error: true,
        success: false,
      });
    }

    if (user.verify_email) {
      return response.json({
        message: "Email already verified",
        success: true,
        error: false,
      });
    }

    await UserModel.updateOne({ _id: code }, { verify_email: true });

    return response.json({
      message: "Email verification successful",
      success: true,
      error: false,
    });
  } catch ( error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginController(request, response) {
  try {
    const payload =
      request.validated?.body || (await loginSchema.parseAsync(request.body));
    const {
      email,
      password,
      guestCart,
      guestAddresses,
      guestOrders = [],
    } = payload;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(403).json({
        message: "Account disabled. Contact support.",
        error: true,
        success: false,
      });
    }

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) {
      return response.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false,
      });
    }

    await mergeGuestCart(user._id, guestCart);
    await mergeGuestAddresses(user._id, guestAddresses);
    const mergedGuestOrderIds = await mergeGuestOrders(user, guestOrders);

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);
    const hashedRefresh = await hashRefreshToken(refreshToken);

    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: hashedRefresh,
    });

    response.cookie("accessToken", accessToken, cookieConfig);
    response.cookie("refreshToken", refreshToken, cookieConfig);

    return response.json({
      message: "Login successful",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
        mergedGuestOrders: mergedGuestOrderIds,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function logoutController(request, response) {
  try {
    const userId = request.userId;

    response.clearCookie("accessToken", cookieConfig);
    response.clearCookie("refreshToken", cookieConfig);

    if (userId) {
      await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });
    }

    return response.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function uploadAvatar(request, response) {
  try {
    const userId = request.userId;
    const image = request.file;

    if (!image) {
      return response.status(400).json({
        message: "No image uploaded",
        error: true,
        success: false,
      });
    }

    const upload = await uploadImageClodinary(image);

    await UserModel.findByIdAndUpdate(userId, { avatar: upload.url });

    return response.json({
      message: "Profile photo updated",
      success: true,
      error: false,
      data: { _id: userId, avatar: upload.url },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId;
    const { name, email, mobile, password } = request.body;

    const updates = {};

    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (mobile) updates.mobile = mobile.trim();

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updates.password = await bcryptjs.hash(password, salt);
    }

    if (!Object.keys(updates).length) {
      return response.status(400).json({
        message: "No fields to update",
        error: true,
        success: false,
      });
    }

    await UserModel.updateOne({ _id: userId }, updates);

    return response.json({
      message: "Profile updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function forgotPasswordController(request, response) {
  try {
    const payload =
      request.validated?.body ||
      (await forgotPasswordSchema.parseAsync(request.body));
    const { email } = payload;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(200).json({
        message: "If the email exists, an OTP has been sent",
        error: false,
        success: true,
      });
    }

    const otp = generatedOtp();
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
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

    return response.json({
      message: "If the email exists, an OTP has been sent",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyForgotPasswordOtp(request, response) {
  try {
    const payload =
      request.validated?.body ||
      (await verifyForgotOtpSchema.parseAsync(request.body));
    const { email, otp } = payload;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Invalid OTP or email",
        error: true,
        success: false,
      });
    }

    if (
      !user.forgot_password_otp ||
      !user.forgot_password_expiry ||
      user.forgot_password_expiry.getTime() < Date.now() ||
      user.forgot_password_otp !== otp
    ) {
      return response.status(400).json({
        message: "Invalid or expired OTP",
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: null,
    });

    return response.json({
      message: "OTP verified successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function resetpassword(request, response) {
  try {
    const payload =
      request.validated?.body ||
      (await resetPasswordSchema.parseAsync(request.body));
    const { email, newPassword, confirmPassword } = payload;

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Invalid request",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashPassword,
      forgot_password_otp: "",
      forgot_password_expiry: null,
    });

    return response.json({
      message: "Password updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function refreshToken(request, response) {
  try {
    const token =
      request.cookies.refreshToken ||
      (request.headers.authorization?.startsWith("Bearer ")
        ? request.headers.authorization.split(" ")[1]
        : "");

    if (!token) {
      return response.status(401).json({
        message: "Refresh token missing",
        error: true,
        success: false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);
    } catch {
      return response.status(401).json({
        message: "Invalid refresh token",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(decoded?.id);
    if (!user || !user.refresh_token) {
      return response.status(401).json({
        message: "Invalid refresh token",
        error: true,
        success: false,
      });
    }

    const matches = await bcryptjs.compare(token, user.refresh_token);
    if (!matches) {
      return response.status(403).json({
        message: "Refresh token mismatch",
        error: true,
        success: false,
      });
    }

    const newAccessToken = await generatedAccessToken(user._id);
    const newRefreshToken = await genertedRefreshToken(user._id);
    const hashedRefresh = await hashRefreshToken(newRefreshToken);

    await UserModel.findByIdAndUpdate(user._id, {
      refresh_token: hashedRefresh,
    });

    response.cookie("accessToken", newAccessToken, cookieConfig);
    response.cookie("refreshToken", newRefreshToken, cookieConfig);

    return response.json({
      message: "Token refreshed",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    const user = await UserModel.findById(userId).select(
      "-password -refresh_token -forgot_password_otp -forgot_password_expiry"
    );

    return response.json({
      message: "User details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}