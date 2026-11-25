import { guestStripeCheckoutController } from "@/fullstack/controllers/order/handlers";
import { stripeCheckoutPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(
  guestStripeCheckoutController,
  stripeCheckoutPostOpts,
);
