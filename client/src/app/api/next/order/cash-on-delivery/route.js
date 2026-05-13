import { CashOnDeliveryOrderController } from "@/fullstack/controllers/order/handlers";
import { codOrderPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(CashOnDeliveryOrderController, codOrderPostOpts);
