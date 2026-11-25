import { getSubCategoryController } from "@/fullstack/controllers/subcategory/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(getSubCategoryController);
