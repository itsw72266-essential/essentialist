import { getCartItemController } from "@/fullstack/controllers/cart/handlers";
import { asAuthGet } from "@/fullstack/lib/nextRoute";

export const GET = asAuthGet(getCartItemController);
