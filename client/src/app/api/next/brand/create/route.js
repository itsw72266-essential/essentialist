import { createBrandController } from "@/fullstack/controllers/brand/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPost(createBrandController);
