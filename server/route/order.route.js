import express, { Router } from "express";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import {
  CashOnDeliveryOrderController,
  GuestCashOnDeliveryOrderController,
  getOrderDetailsController,
  paymentController,
  webhookStripe,
  verifyReceiptByTokenController,
  downloadReceiptController,
} from "../controllers/order.controller.js";
import {
  ordersLimiter,
  paymentsLimiter,
  webhookLimiter,
} from "../middleware/rateLimiter.js";
import { requireIdempotencyKey } from "../middleware/idempotency.js";
import { duplicateOrderGuard } from "../middleware/duplicateOrderGuard.js";
import verifyStripeSignature from "../middleware/verifyStripeSignature.js";

const orderRouter = Router();

orderRouter.post("/verify-receipt", verifyReceiptByTokenController);

orderRouter.post(
  "/cash-on-delivery",
  auth,
  ordersLimiter,
  requireIdempotencyKey({ prefix: "cod-order" }),
  duplicateOrderGuard(),
  CashOnDeliveryOrderController
);

orderRouter.post(
  "/guest-cod",
  ordersLimiter,
  requireIdempotencyKey({ prefix: "guest-cod" }),
  duplicateOrderGuard(),
  GuestCashOnDeliveryOrderController
);

orderRouter.post(
  "/checkout",
  auth,
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "stripe-checkout" }),
  paymentController
);

orderRouter.post(
  "/webhook",
  webhookLimiter,
  verifyStripeSignature,
  webhookStripe
);

orderRouter.get("/order-list", auth, getOrderDetailsController);

orderRouter.get(
  "/receipt/:orderId",
  optionalAuth,
  downloadReceiptController
);

export default orderRouter;