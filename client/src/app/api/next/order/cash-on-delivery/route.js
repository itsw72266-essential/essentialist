import { CashOnDeliveryOrderController } from "@/fullstack/controllers/order/handlers";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(CashOnDeliveryOrderController);
