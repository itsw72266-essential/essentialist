import { getGuestOrdersController } from "@/fullstack/controllers/guestadmin/handlers";
import { asAdminGet } from "@/fullstack/lib/nextRoute";

export const GET = asAdminGet(getGuestOrdersController);
