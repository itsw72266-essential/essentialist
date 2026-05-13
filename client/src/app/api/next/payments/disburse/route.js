import { paymentsPostDisburse } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitDisbursePostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(paymentsPostDisburse, payunitDisbursePostOpts);
