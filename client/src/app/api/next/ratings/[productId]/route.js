import { deleteMyRating, getRatingsForProduct } from "@/fullstack/controllers/rating/handlers";
import { asOptionalAuthDeleteWithParams, asPublicGet } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGet(getRatingsForProduct);
export const DELETE = asOptionalAuthDeleteWithParams(deleteMyRating);
