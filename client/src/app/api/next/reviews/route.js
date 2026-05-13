import {
  adminListReviews,
  createOrUpdateReview,
} from "@/fullstack/controllers/review/handlers";
import { asAdminPrivilegeGet, asAuthPost } from "@/fullstack/lib/nextRoute";

export const GET = asAdminPrivilegeGet(adminListReviews);
export const POST = asAuthPost(createOrUpdateReview);
