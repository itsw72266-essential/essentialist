import { listReviews } from "@/fullstack/controllers/review/handlers";
import { asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGetWithParams(listReviews);
