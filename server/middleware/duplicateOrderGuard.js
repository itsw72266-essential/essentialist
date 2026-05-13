// middleware/duplicateOrderGuard.js
import OrderModel from "../models/order.model.js";
import { buildOrderFingerprint } from "../utils/orderFingerprint.js";

export function duplicateOrderGuard({ windowMinutes = 15 } = {}) {
  return async function guard(req, res, next) {
    try {
      const listItems = req.body?.list_items;
      if (!Array.isArray(listItems) || !listItems.length) {
        return next();
      }

      const totalAmt = Number(
        req.body.totalAmt ?? req.body.subTotalAmt ?? 0
      );
      const fingerprint = buildOrderFingerprint({
        userId: req.userId,
        customerEmail:
          req.body.email ??
          req.body.customer_email ??
          req.body.contact_info?.customer_email,
        customerPhone:
          req.body.phone ??
          req.body.mobile ??
          req.body.contact_info?.mobile,
        listItems,
        totalAmt,
        currency:
          req.body.currency ||
          process.env.ORDER_DEFAULT_CURRENCY ||
          "XAF",
      });

      if (!fingerprint) {
        return next();
      }

      const since = new Date(Date.now() - windowMinutes * 60 * 1000);
      const existing = await OrderModel.findOne({
        orderFingerprint: fingerprint,
        createdAt: { $gte: since },
      })
        .select("orderId integrityToken createdAt")
        .lean();

      if (existing) {
        return res.status(409).json({
          message:
            "Duplicate order attempt blocked. Please review your previous order before retrying.",
          orderId: existing.orderId,
          integrityToken: existing.integrityToken,
          error: true,
          success: false,
        });
      }

      req.orderFingerprint = fingerprint;
      return next();
    } catch (error) {
      console.error("[duplicateOrderGuard] error:", error);
      return res.status(500).json({
        message: "Unable to validate order uniqueness right now.",
        error: true,
        success: false,
      });
    }
  };
}