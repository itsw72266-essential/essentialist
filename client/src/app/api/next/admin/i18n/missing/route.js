import { getMissingTranslationsController } from "@/fullstack/controllers/i18n/handlers";
import { asAdminGet } from "@/fullstack/lib/nextRoute";

export const GET = asAdminGet(getMissingTranslationsController);
