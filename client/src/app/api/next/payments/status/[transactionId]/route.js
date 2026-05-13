import { paymentsGetTransactionStatus } from "@/fullstack/controllers/payments/paymentsHandlers";
import { paymentsPollGetOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGetWithParams(
  paymentsGetTransactionStatus,
  paymentsPollGetOpts,
);
