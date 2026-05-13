import { paymentsPostOrange } from "@/fullstack/controllers/payments/paymentsHandlers";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(paymentsPostOrange);
