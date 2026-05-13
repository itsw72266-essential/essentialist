import { downloadReceiptController } from "@/fullstack/controllers/order/handlers";
import { asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGetWithParams(downloadReceiptController);
