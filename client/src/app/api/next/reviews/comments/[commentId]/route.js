import { deleteReviewComment } from "@/fullstack/controllers/review/handlers";
import { asOptionalAuthDeleteWithParams } from "@/fullstack/lib/nextRoute";

export const DELETE = asOptionalAuthDeleteWithParams(deleteReviewComment);
