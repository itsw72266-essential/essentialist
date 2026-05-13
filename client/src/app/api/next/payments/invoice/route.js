import { paymentsPostInvoice } from "@/fullstack/controllers/payments/paymentsHandlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(paymentsPostInvoice);
