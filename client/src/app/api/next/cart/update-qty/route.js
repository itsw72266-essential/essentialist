import { updateCartItemQtyController } from "@/fullstack/controllers/cart/handlers";
import { asAuthPut } from "@/fullstack/lib/nextRoute";

export const PUT = asAuthPut(updateCartItemQtyController);
