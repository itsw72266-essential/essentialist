/**
 * List rows missing translations.fr.* (products, brands, etc.).
 *
 * Usage (from client/):
 *   pnpm list:missing-fr
 *   pnpm list:missing-fr -- --entity=products
 *   pnpm list:missing-fr -- --entity=products --field=name --limit=200
 *   pnpm list:missing-fr -- --export=missing-fr-products.csv
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const { connectMongo } = await import("../src/fullstack/db/mongoose.js");
const {
  getFrenchTranslationStats,
  listMissingFrenchTranslations,
} = await import("../src/fullstack/utils/auto-translate.js");

function parseArgs(argv) {
  const options = {
    entity: "products",
    limit: 500,
    skip: 0,
    search: "",
    field: "name",
    exportPath: "",
  };

  for (const arg of argv) {
    if (arg.startsWith("--entity=")) {
      options.entity = arg.slice("--entity=".length).trim();
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length)) || 500;
    } else if (arg.startsWith("--skip=")) {
      options.skip = Number(arg.slice("--skip=".length)) || 0;
    } else if (arg.startsWith("--search=")) {
      options.search = arg.slice("--search=".length);
    } else if (arg.startsWith("--field=")) {
      options.field = arg.slice("--field=".length);
    } else if (arg.startsWith("--export=")) {
      options.exportPath = arg.slice("--export=".length);
    }
  }

  return options;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.MONGODB_URI?.trim()) {
    console.error("MONGODB_URI is missing. Set it in client/.env");
    process.exit(1);
  }

  await connectMongo();

  console.log("French translation coverage (all entities):");
  console.log(JSON.stringify(await getFrenchTranslationStats(), null, 2));
  console.log("");

  const report = await listMissingFrenchTranslations({
    entity: options.entity,
    limit: options.limit,
    skip: options.skip,
    search: options.search,
    field: options.field,
  });

  console.log(
    `Missing French for "${options.entity}"` +
      (options.field ? ` (field: ${options.field})` : "") +
      ` — showing ${report.items.length} of ${report.total}:\n`,
  );

  if (!report.items.length) {
    console.log("None — all scanned rows have French for the selected filter.");
  } else {
    for (const row of report.items) {
      console.log(
        `- ${row.label} | id=${row._id} | slug=${row.slug || "—"} | missing: ${row.missingFields.join(", ")}`,
      );
    }
  }

  if (options.exportPath) {
    const header = ["entity", "_id", "slug", "label", "missingFields", "editHref"];
    const lines = [
      header.join(","),
      ...report.items.map((row) =>
        [
          options.entity,
          row._id,
          row.slug,
          row.label,
          row.missingFields.join(";"),
          row.editHref,
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];
    const out = path.resolve(process.cwd(), options.exportPath);
    fs.writeFileSync(out, `${lines.join("\n")}\n`, "utf8");
    console.log(`\nWrote ${report.items.length} rows to ${out}`);
  }

  if (report.total > report.skip + report.items.length) {
    console.log(
      `\nTip: ${report.total - report.skip - report.items.length} more rows — increase --limit or use --skip.`,
    );
  }

  console.log("\nFix options:");
  console.log("  • Dashboard → French translations");
  console.log("  • pnpm backfill:fr (needs GEMINI_API_KEY)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
