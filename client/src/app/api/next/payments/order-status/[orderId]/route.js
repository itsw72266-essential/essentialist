import { paymentsGetOrderStatus } from "@/fullstack/controllers/payments/paymentsHandlers";
import { paymentsPollGetOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asAuthGetWithParams(paymentsGetOrderStatus, paymentsPollGetOpts);
