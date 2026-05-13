import { paymentsPostGuestOrange } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitGuestOrangePostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(
  paymentsPostGuestOrange,
  payunitGuestOrangePostOpts,
);
