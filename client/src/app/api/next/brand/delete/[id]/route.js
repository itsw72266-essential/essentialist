import { deleteBrandController } from "@/fullstack/controllers/brand/handlers";
import { asAdminDeleteWithParams } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminDeleteWithParams(deleteBrandController);
