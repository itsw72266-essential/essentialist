import { paymentsPostMtn } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitMtnPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(paymentsPostMtn, payunitMtnPostOpts);
