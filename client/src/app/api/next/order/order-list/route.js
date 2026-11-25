import { getOrderDetailsController } from "@/fullstack/controllers/order/handlers";
import { asAuthGet } from "@/fullstack/lib/nextRoute";

export const GET = asAuthGet(getOrderDetailsController);
