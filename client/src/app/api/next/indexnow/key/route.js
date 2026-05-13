import { indexNowGetKeyController } from "@/fullstack/controllers/indexnow/handlers";
import { asPublicGet } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGet(indexNowGetKeyController);
