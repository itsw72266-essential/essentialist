import { GuestCashOnDeliveryOrderController } from "@/fullstack/controllers/order/handlers";
import { guestCodOrderPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(
  GuestCashOnDeliveryOrderController,
  guestCodOrderPostOpts,
);
