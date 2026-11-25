export const dynamic = "force-dynamic";

import { listReviews } from "@/fullstack/controllers/review/handlers";
import { asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGetWithParams(listReviews);
