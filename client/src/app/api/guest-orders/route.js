import { GuestCashOnDeliveryOrderController } from "@/fullstack/controllers/order/handlers";
import { guestCodOrderPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";
import { NextResponse } from "next/server";

/** Legacy path used by SummaryApi; same handler as `/api/next/order/guest-cod`. */
export const POST = asPublicPost(
  GuestCashOnDeliveryOrderController,
  guestCodOrderPostOpts,
);

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: true,
      message:
        "Guest order listing is not exposed here. Use admin tools or order receipt routes.",
    },
    { status: 404 },
  );
}
