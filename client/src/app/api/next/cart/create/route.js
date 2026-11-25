import { addToCartItemController } from "@/fullstack/controllers/cart/handlers";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(addToCartItemController);
