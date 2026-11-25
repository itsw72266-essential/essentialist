import { deleteBlogController } from "@/fullstack/controllers/blog/handlers";
import { asAdminDeleteWithParams } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminDeleteWithParams(deleteBlogController);
