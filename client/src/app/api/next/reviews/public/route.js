import { listReviews } from "@/fullstack/controllers/review/handlers";
import { asOptionalAuthGet } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGet(listReviews);
