import { deleteCategoryController } from "@/fullstack/controllers/category/handlers";
import { asAdminDelete } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminDelete(deleteCategoryController);
