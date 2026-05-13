// backend/jobs/receiptRegenerator.js
import cron from "node-cron";
import OrderModel from "../models/order.model.js";
import { ensureIntegrityProof } from "../controllers/order.controller.js";

const ENABLE_JOB =
  (process.env.ENABLE_RECEIPT_REGEN || "").toLowerCase() !== "false";
const SCHEDULE = process.env.RECEIPT_REGEN_SCHEDULE || "*/30 * * * *";
const TIMEZONE = process.env.RECEIPT_REGEN_TZ || "UTC";
const MAX_BATCH = Number(process.env.RECEIPT_REGEN_BATCH_SIZE || 25);
const STALE_MINUTES = Number(process.env.RECEIPT_REGEN_MAX_AGE_MINUTES || 720);

if (ENABLE_JOB) {
  cron.schedule(
    SCHEDULE,
    async () => {
      try {
        const staleThreshold = new Date(
          Date.now() - STALE_MINUTES * 60 * 1000
        );
        const candidates = await OrderModel.find({
          $or: [
            { receiptSignature: { $exists: false } },
            { receiptSignature: null },
            { integrityToken: { $exists: false } },
            { integrityToken: "" },
            {
              signatureGeneratedAt: {
                $exists: true,
                $ne: null,
                $lt: staleThreshold,
              },
            },
          ],
        })
          .sort({ updatedAt: -1 })
          .limit(MAX_BATCH)
          .lean();

        if (!candidates.length) {
          return;
        }

        await Promise.all(
          candidates.map(async (orderDoc) => {
            try {
              await ensureIntegrityProof(orderDoc);
            } catch (error) {
              console.error(
                "receiptRegenerator: failed to regenerate receipt",
                orderDoc.orderId,
                error
              );
            }
          })
        );
      } catch (error) {
        console.error("receiptRegenerator: job failed", error);
      }
    },
    {
      timezone: TIMEZONE,
    }
  );

  console.info(
    `Receipt regeneration job scheduled (${SCHEDULE} ${TIMEZONE}) with batch size ${MAX_BATCH}.`
  );
} else {
  console.info(
    "Receipt regeneration job disabled (set ENABLE_RECEIPT_REGEN to true to enable)."
  );
}