import { getAdminDashboardController } from "@/fullstack/controllers/guestadmin/handlers";
import { asAdminGet } from "@/fullstack/lib/nextRoute";

/**
 * Guest-style dashboard totals (orders/users/revenue snapshot).
 * Use when you need the shape from `guestadmin.controller` (not the chart stats route).
 */
export const GET = asAdminGet(getAdminDashboardController);
