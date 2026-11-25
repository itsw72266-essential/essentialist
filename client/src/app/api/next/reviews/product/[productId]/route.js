import { deleteMyReview, listReviews } from "@/fullstack/controllers/review/handlers";
import { asAuthDeleteWithParams, asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

/** Mirrors `GET|DELETE /api/reviews/:productId` — use `/api/next/reviews/product/:productId`. */
export const GET = asOptionalAuthGetWithParams(listReviews);
export const DELETE = asAuthDeleteWithParams(deleteMyReview);
