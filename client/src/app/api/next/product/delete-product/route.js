import { deleteProductDetails } from "@/fullstack/controllers/product/handlers";
import { asAdminDelete } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminDelete(deleteProductDetails);
