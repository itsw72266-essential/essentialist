import { getProductByCategoryAndSubCategory } from "@/fullstack/controllers/product/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(getProductByCategoryAndSubCategory);
