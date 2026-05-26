import {
  backfillFrenchTranslations,
  getFrenchTranslationStats,
  isAutoTranslateEnabled,
  listMissingFrenchTranslations,
  PRODUCT_TRANSLATION_FIELDS,
} from "../../utils/auto-translate.js";

export async function getTranslationStatsController(request, response) {
  try {
    const stats = await getFrenchTranslationStats();
    return response.json({
      message: "Translation stats",
      success: true,
      error: false,
      data: stats,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to load translation stats",
      success: false,
      error: true,
    });
  }
}

export async function getMissingTranslationsController(request, response) {
  try {
    const { entity, limit, skip, search, field } = request.query || {};
    const data = await listMissingFrenchTranslations({
      entity: entity || "products",
      limit: limit ? Number(limit) : 50,
      skip: skip ? Number(skip) : 0,
      search: search || "",
      field: field || "",
    });
    const summary = await getFrenchTranslationStats();

    return response.json({
      message: "Missing French translations",
      success: true,
      error: false,
      data: {
        ...data,
        summary,
        hint:
          "French names shown on the site come from translations.fr.name in MongoDB. " +
          "Edit in Product admin or run pnpm backfill:fr when GEMINI_API_KEY is set.",
        productFields: PRODUCT_TRANSLATION_FIELDS,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Unable to list missing translations",
      success: false,
      error: true,
    });
  }
}

export async function backfillTranslationsController(request, response) {
  try {
    if (!isAutoTranslateEnabled()) {
      return response.status(503).json({
        message: "GEMINI_API_KEY is not configured on the server",
        success: false,
        error: true,
      });
    }

    const {
      entities,
      batchSize = 25,
      delayMs = 400,
      onlyMissing = true,
    } = request.body || {};

    const report = await backfillFrenchTranslations({
      entities: Array.isArray(entities) ? entities : undefined,
      batchSize: Math.min(Math.max(Number(batchSize) || 25, 1), 50),
      delayMs: Math.min(Math.max(Number(delayMs) || 400, 0), 5000),
      onlyMissing: onlyMissing !== false,
    });

    return response.json({
      message: report.hasMore
        ? "Batch complete — more items still need translation. Run again to continue."
        : "Backfill complete for selected entities",
      success: true,
      error: false,
      data: report,
    });
  } catch (error) {
    console.error("backfillTranslationsController", error);
    return response.status(500).json({
      message: error.message || "Backfill failed",
      success: false,
      error: true,
    });
  }
}
