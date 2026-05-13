import { getAdminDashboardStats } from "@/fullstack/controllers/admin/handlers";
import { asAdminGet } from "@/fullstack/lib/nextRoute";

/** Matches Express: first `admin.routes` wins on `GET /api/admin/dashboard` (stats + series). */
export const GET = asAdminGet(getAdminDashboardStats);
