import { paymentController } from "@/fullstack/controllers/order/handlers";
import { stripeCheckoutPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(paymentController, stripeCheckoutPostOpts);
