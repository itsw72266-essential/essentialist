import { updateBrandController } from "@/fullstack/controllers/brand/handlers";
import { asAdminPutWithParams } from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPutWithParams(updateBrandController);
