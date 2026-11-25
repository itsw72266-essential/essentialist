import { deleteSubCategoryController } from "@/fullstack/controllers/subcategory/handlers";
import { asAdminDelete } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminDelete(deleteSubCategoryController);
