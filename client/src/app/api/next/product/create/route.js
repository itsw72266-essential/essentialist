import { createProductController } from "@/fullstack/controllers/product/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPost(createProductController);
