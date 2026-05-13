import { adminDeleteReviewComment } from "@/fullstack/controllers/review/handlers";
import { asAdminPrivilegeDeleteWithParams } from "@/fullstack/lib/nextRoute";

export const DELETE = asAdminPrivilegeDeleteWithParams(adminDeleteReviewComment);
