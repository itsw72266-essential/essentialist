import { markOrderDeliveredController } from "@/fullstack/controllers/guestadmin/handlers";
import { asAdminPatchWithParams } from "@/fullstack/lib/nextRoute";

export const PATCH = asAdminPatchWithParams(markOrderDeliveredController);
