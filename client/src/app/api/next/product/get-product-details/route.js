export const dynamic = "force-dynamic";

import { getProductDetails } from "@/fullstack/controllers/product/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(getProductDetails);
