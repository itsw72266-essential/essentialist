// middleware/verifyStripeSignature.js
import Stripe from "../config/stripe.js";

const { STRIPE_WEBHOOK_SECRET } = process.env;

export default function verifyStripeSignature(req, res, next) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error(
      "[verifyStripeSignature] STRIPE_WEBHOOK_SECRET is missing."
    );
    return res.status(500).json({
      message: "Webhook secret not configured.",
      error: true,
      success: false,
    });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({
      message: "Missing Stripe signature header.",
      error: true,
      success: false,
    });
  }

  try {
    const event = Stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    req.stripeEvent = event;
    req.body = event;
    return next();
  } catch (error) {
    console.error("[verifyStripeSignature] error:", error.message);
    return res.status(400).json({
      message: `Invalid Stripe signature: ${error.message}`,
      error: true,
      success: false,
    });
  }
}