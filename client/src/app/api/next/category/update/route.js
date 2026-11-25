export const dynamic = "force-dynamic";

import { updateCategoryController } from "@/fullstack/controllers/category/handlers";
import { asAdminPut } from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPut(updateCategoryController);
