import { NextResponse } from "next/server";
import mongoose from "mongoose";

import ReviewModel from "@/fullstack/models/review.model.js";

const MAX_IDS = 50;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: true, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const raw = Array.isArray(body?.productIds) ? body.productIds : [];
  const sanitized = [
    ...new Set(
      raw
        .map((x) => (x == null ? "" : String(x)))
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ].slice(0, MAX_IDS);

  const empty = {};
  for (const id of sanitized) {
    empty[id] = { average: 0, count: 0 };
  }

  if (!sanitized.length) {
    return NextResponse.json(
      { success: true, error: false, data: {} },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const oids = sanitized.map((id) => new mongoose.Types.ObjectId(id));

  const rows = await ReviewModel.aggregate([
    {
      $match: {
        product: { $in: oids },
        status: "published",
        subjectType: "product",
      },
    },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const out = { ...empty };
  for (const row of rows) {
    const key = String(row._id);
    out[key] = {
      average: Number((row.average || 0).toFixed(2)),
      count: Number(row.count) || 0,
    };
  }

  return NextResponse.json(
    { success: true, error: false, data: out },
    {
      headers: {
        // Per-response varies by body; avoid shared CDN cache confusion.
        "Cache-Control": "private, max-age=30",
      },
    },
  );
}
