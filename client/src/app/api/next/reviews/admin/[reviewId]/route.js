import { adminDeleteReview, adminUpdateReview } from "@/fullstack/controllers/review/handlers";
import {
  asAdminPrivilegeDeleteWithParams,
  asAdminPrivilegePutWithParams,
} from "@/fullstack/lib/nextRoute";

export const PUT = asAdminPrivilegePutWithParams(adminUpdateReview);
export const DELETE = asAdminPrivilegeDeleteWithParams(adminDeleteReview);
