import { createReviewComment, listReviewComments } from "@/fullstack/controllers/review/handlers";
import { asAuthPostWithParams, asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

/** Mirrors `/api/reviews/:reviewId/comments` as `/api/next/reviews/review/:reviewId/comments`. */
export const GET = asOptionalAuthGetWithParams(listReviewComments);
export const POST = asAuthPostWithParams(createReviewComment);
