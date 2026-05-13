import { updateProductDetails } from "@/fullstack/controllers/product/handlers";
import { asAdminPut } from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPut(updateProductDetails);
