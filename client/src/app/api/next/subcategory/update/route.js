import { updateSubCategoryController } from "@/fullstack/controllers/subcategory/handlers";
import { asAdminPut } from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPut(updateSubCategoryController);
