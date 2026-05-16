import {
  backfillFrenchTranslations,
  getFrenchTranslationStats,
  isAutoTranslateEnabled,
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
