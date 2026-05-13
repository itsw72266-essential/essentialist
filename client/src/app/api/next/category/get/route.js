import { getCategoryController } from "@/fullstack/controllers/category/handlers";
import { asPublicGet } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGet(getCategoryController);
