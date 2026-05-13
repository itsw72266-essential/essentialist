import { paymentsPostGuestMtn } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitGuestMtnPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(paymentsPostGuestMtn, payunitGuestMtnPostOpts);
