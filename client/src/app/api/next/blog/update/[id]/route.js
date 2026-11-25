export const dynamic = "force-dynamic";

import { updateBlogController } from "@/fullstack/controllers/blog/handlers";
import { asAdminPutWithParams } from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPutWithParams(updateBlogController);
