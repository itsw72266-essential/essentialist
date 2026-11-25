export const dynamic = "force-dynamic";

import { AddCategoryController } from "@/fullstack/controllers/category/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPost(AddCategoryController);
