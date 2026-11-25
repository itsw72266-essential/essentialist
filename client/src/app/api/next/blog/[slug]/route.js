export const dynamic = "force-dynamic";

import { getBlogBySlugController } from "@/fullstack/controllers/blog/handlers";
import { asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGetWithParams(getBlogBySlugController);
