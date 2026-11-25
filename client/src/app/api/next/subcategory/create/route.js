import { AddSubCategoryController } from "@/fullstack/controllers/subcategory/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPost(AddSubCategoryController);
