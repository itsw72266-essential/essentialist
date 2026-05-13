import UserModel from "../../models/user.model.js";
import { mergeGuestDataSchema } from "../../schemas/auth.schema.js";
import {
  mergeGuestAddresses,
  mergeGuestCart,
  mergeGuestOrders,
} from "../../lib/guestMerge.js";

/**
 * POST — merge local guest cart / addresses / optional guest orders into the
 * authenticated user (same logic as login when those payloads are sent).
 */
export async function mergeGuestDataController(request, response) {
  try {
    const userId = request.userId;

    const parsed = mergeGuestDataSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return response.status(400).json({
        message: "Invalid payload",
        error: true,
        success: false,
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const { guestCart, guestAddresses, guestOrders } = parsed.data;

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    await mergeGuestCart(userId, guestCart);
    await mergeGuestAddresses(userId, guestAddresses);
    const mergedGuestOrders = await mergeGuestOrders(user, guestOrders);

    return response.json({
      message: "Guest data merged successfully",
      error: false,
      success: true,
      data: { mergedGuestOrders },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
