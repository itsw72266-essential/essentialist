import { backfillTranslationsController } from "@/fullstack/controllers/i18n/handlers";
import { asAdminPost } from "@/fullstack/lib/nextRoute";

/** POST — translate up to `batchSize` catalog rows per entity (admin only). */
export const POST = asAdminPost(backfillTranslationsController);
