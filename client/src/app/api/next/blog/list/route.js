import { getBlogListController } from "@/fullstack/controllers/blog/handlers";
import { asOptionalAuthGet } from "@/fullstack/lib/nextRoute";

export const GET = asOptionalAuthGet(getBlogListController);
