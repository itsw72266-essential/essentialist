import { paymentsPostOrange } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitOrangePostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(paymentsPostOrange, payunitOrangePostOpts);
