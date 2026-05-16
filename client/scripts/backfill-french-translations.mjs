/**
 * Backfill translations.fr.* for the whole catalog (run locally against production DB).
 *
 * Usage (from client/):
 *   npm run backfill:fr
 *   npm run backfill:fr -- --entities=products,brands --batch=50
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const { connectMongo } = await import("../src/fullstack/db/mongoose.js");
const { backfillFrenchTranslations, getFrenchTranslationStats } = await import(
  "../src/fullstack/utils/auto-translate.js"
);

function parseArgs(argv) {
  const options = {
    entities: ["products", "brands", "categories", "subcategories", "blogs"],
    batchSize: 25,
    delayMs: 1200,
    onlyMissing: true,
  };

  for (const arg of argv) {
    if (arg.startsWith("--entities=")) {
      options.entities = arg
        .slice("--entities=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--batch=")) {
      options.batchSize = Number(arg.slice("--batch=".length)) || 25;
    } else if (arg.startsWith("--delay=")) {
      options.delayMs = Number(arg.slice("--delay=".length)) || 400;
    } else if (arg === "--force") {
      options.onlyMissing = false;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("GEMINI_API_KEY is missing. Set it in client/.env");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI?.trim()) {
    console.error("MONGODB_URI is missing. Set it in client/.env");
    process.exit(1);
  }

  await connectMongo();

  console.log("Translation stats before backfill:");
  console.log(JSON.stringify(await getFrenchTranslationStats(), null, 2));

  let round = 0;
  let hasMore = true;

  while (hasMore) {
    round++;
    console.log(`\n--- Backfill round ${round} ---`);
    const report = await backfillFrenchTranslations(options);
    console.log(JSON.stringify(report, null, 2));
    hasMore = report.hasMore;
    if (!hasMore) break;
  }

  console.log("\nTranslation stats after backfill:");
  console.log(JSON.stringify(await getFrenchTranslationStats(), null, 2));
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
