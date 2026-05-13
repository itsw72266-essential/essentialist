import { paymentsPostInvoice } from "@/fullstack/controllers/payments/paymentsHandlers";
import { payunitInvoicePostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(paymentsPostInvoice, payunitInvoicePostOpts);
