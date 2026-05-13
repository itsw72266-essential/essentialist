import { createBlogController } from "@/fullstack/controllers/blog/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

export const POST = asAdminPost(createBlogController);
