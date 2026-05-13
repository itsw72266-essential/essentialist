import OrderModel from "../models/order.model.js";
import { buildOrderFingerprint } from "./orderFingerprint.js";

const DEFAULT_WINDOW_MIN = 15;

/**
 * If a matching order was created recently, return an error payload for HTTP 409.
 * Mirrors `server/middleware/duplicateOrderGuard.js`.
 */
export async function findBlockingDuplicateOrder(
  body,
  userId,
  windowMinutes = DEFAULT_WINDOW_MIN,
) {
  const listItems = body?.list_items;
  if (!Array.isArray(listItems) || !listItems.length) {
    return null;
  }

  const totalAmt = Number(body?.totalAmt ?? body?.subTotalAmt ?? 0);

  const fingerprint = buildOrderFingerprint({
    userId,
    customerEmail:
      body?.email ??
      body?.customer_email ??
      body?.contact_info?.customer_email,
    customerPhone:
      body?.phone ??
      body?.mobile ??
      body?.contact_info?.mobile,
    listItems,
    totalAmt,
    currency:
      body?.currency ||
      process.env.ORDER_DEFAULT_CURRENCY ||
      "XAF",
  });

  if (!fingerprint) return null;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  const existing = await OrderModel.findOne({
    orderFingerprint: fingerprint,
    createdAt: { $gte: since },
  })
    .select("orderId integrityToken createdAt")
    .lean();

  if (!existing) return null;

  return {
    status: 409,
    body: {
      message:
        "Duplicate order attempt blocked. Please review your previous order before retrying.",
      orderId: existing.orderId,
      integrityToken: existing.integrityToken,
      error: true,
      success: false,
    },
  };
}
