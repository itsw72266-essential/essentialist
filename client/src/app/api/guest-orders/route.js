import { GuestCashOnDeliveryOrderController } from "@/fullstack/controllers/order/handlers";
import { guestCodOrderPostOpts } from "@/fullstack/lib/orderAndPaymentRouteOpts";
import { asPublicPost } from "@/fullstack/lib/nextRoute";
import { NextResponse } from "next/server";

/** Back-compat alias: same handler as `POST /api/next/order/guest-cod` (SummaryApi may still reference this path). */
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
