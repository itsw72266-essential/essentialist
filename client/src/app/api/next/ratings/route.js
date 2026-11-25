import { upsertRating } from "@/fullstack/controllers/rating/handlers";
import { asOptionalAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asOptionalAuthPost(upsertRating);
