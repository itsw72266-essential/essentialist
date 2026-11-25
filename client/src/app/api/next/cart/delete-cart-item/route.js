import { deleteCartItemQtyController } from "@/fullstack/controllers/cart/handlers";
import { asAuthDelete } from "@/fullstack/lib/nextRoute";

export const DELETE = asAuthDelete(deleteCartItemQtyController);
