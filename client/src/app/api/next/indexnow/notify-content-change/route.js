export const dynamic = "force-dynamic";

import { indexNowNotifyContentChangeController } from "@/fullstack/controllers/indexnow/handlers";
import { asPublicPost } from "@/fullstack/lib/nextRoute";

export const POST = asPublicPost(indexNowNotifyContentChangeController);
