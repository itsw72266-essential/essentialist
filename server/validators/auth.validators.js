import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const emailSchema = z
  .string()
  .email()
  .min(6, "Email must be at least 6 characters long")
  .refine((value) => {
    const lower = value.toLowerCase();
    if (!lower.endsWith("@gmail.com")) return true;
    const [localPart] = lower.split("@");
    return localPart.length >= 6;
  }, "Gmail addresses must have at least 6 characters before @gmail.com");

const guestCartItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, "Invalid product id"),
  quantity: z.number().int().positive().max(99).optional().default(1),
});

const guestAddressSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address_line: z.string().max(220).optional(),
  landmark: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  pincode: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  alt_phone: z.string().max(20).optional(),
});

const guestOrderSchema = z.object({
  orderId: z.string().min(6, "Order id is required"),
  integrityToken: z.string().min(16, "Integrity token is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  password: z.string().min(6).max(128),
});

export const verifyEmailSchema = z.object({
  code: z.string().regex(objectIdRegex, "Invalid verification code"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
  guestCart: z.array(guestCartItemSchema).optional(),
  guestAddresses: z
    .array(
      guestAddressSchema.extend({
        street: z.string().max(150).optional(),
      })
    )
    .optional(),
  guestOrders: z.array(guestOrderSchema).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyForgotOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: z.string().min(6).max(128),
  confirmPassword: z.string().min(6).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20),
});