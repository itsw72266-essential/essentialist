import { guestStripeCheckoutController } from "@/fullstack/controllers/order/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(guestStripeCheckoutController);
