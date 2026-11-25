import { getBlogBySlugController } from "@/fullstack/controllers/blog/handlers";
import { asOptionalAuthGetWithParams } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGetWithParams(getBlogBySlugController);
