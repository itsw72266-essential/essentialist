import { paymentsGetGuestOrderStatus } from "@/fullstack/controllers/payments/paymentsHandlers";
import { asPublicGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGetWithParams(paymentsGetGuestOrderStatus);
