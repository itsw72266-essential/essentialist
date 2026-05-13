/**
 * Mongoose User model for Next.js Route Handlers.
 * Schema aligned with server/models/user.model.js — server/ is not modified or imported.
 */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provide name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Provide email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Provide password"],
    },
    avatar: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: null,
    },
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    address_details: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "address",
        },
      ],
      default: [],
    },
    shopping_cart: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "cartProduct",
        },
      ],
      default: [],
    },
    orderHistory: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "order",
        },
      ],
      default: [],
    },
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
