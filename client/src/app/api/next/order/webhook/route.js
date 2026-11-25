import { NextResponse } from "next/server";

import { webhookStripe } from "@/fullstack/controllers/order/handlers";
import Stripe from "@/fullstack/config/stripe";
import { connectMongo } from "@/fullstack/db/mongoose";
import {
  createExpressLikeRequest,
  createExpressResponse,
} from "@/fullstack/lib/invokeController";
import { enforceRateLimit } from "@/fullstack/lib/rateLimiterMemory";

const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET_KEY ||
  process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

export async function POST(request) {
  const limited = await enforceRateLimit("webhooks", request);
  if (limited) {
    return NextResponse.json(limited.body, { status: limited.status });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Webhook secret not configured.", error: true, success: false },
      { status: 500 }
    );
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { message: "Missing Stripe signature header.", error: true, success: false },
      { status: 400 }
    );
  }
  let event;
  try {
    if (!Stripe) {
      return NextResponse.json(
        { message: "Stripe is not configured.", error: true, success: false },
        { status: 500 }
      );
    }
    const buf = await request.text();
    event = Stripe.webhooks.constructEvent(buf, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      {
        message: `Invalid Stripe signature: ${err?.message || err}`,
        error: true,
        success: false,
      },
      { status: 400 }
    );
  }
  await connectMongo();
  const req = createExpressLikeRequest(request, event, {});
  const res = createExpressResponse();
  await webhookStripe(req, res);
  const { status, body } = res.getResult();
  return NextResponse.json(body, { status });
}
