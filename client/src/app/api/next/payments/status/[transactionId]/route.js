import { paymentsGetTransactionStatus } from "@/fullstack/controllers/payments/paymentsHandlers";
import { asPublicGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGetWithParams(paymentsGetTransactionStatus);
