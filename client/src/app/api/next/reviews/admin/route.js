import { adminCreateReview } from "@/fullstack/controllers/review/handlers";
import { asAdminPrivilegePost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPrivilegePost(adminCreateReview);
