import {
  getTranslationStatsController,
} from "@/fullstack/controllers/i18n/handlers";
import { asAdminGet } from "@/fullstack/lib/nextRoute";

export const GET = asAdminGet(getTranslationStatsController);
