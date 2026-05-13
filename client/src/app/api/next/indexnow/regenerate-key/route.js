import { indexNowRegenerateKeyController } from "@/fullstack/controllers/indexnow/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(indexNowRegenerateKeyController);
