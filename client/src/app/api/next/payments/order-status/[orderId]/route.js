import { paymentsGetOrderStatus } from "@/fullstack/controllers/payments/paymentsHandlers";
import { asAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asAuthGetWithParams(paymentsGetOrderStatus);
