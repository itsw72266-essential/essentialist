import {
  ensureUniqueSlug,
  RESERVED_CATALOG_SLUGS,
  slugifyName,
} from "../../lib/catalogSlugs.js";

/**
 * @param {import('mongoose').Model} Model
 * @param {string} name
 * @param {string} [excludeId]
 */
export async function generateUniqueCatalogSlug(Model, name, excludeId) {
  const base = slugifyName(name) || "item";
  let slug = base;
  let n = 2;

  while (true) {
    if (RESERVED_CATALOG_SLUGS.has(slug)) {
      slug = `${base}-${n++}`;
      continue;
    }
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${base}-${n++}`;
  }
}

/**
 * @param {import('mongoose').Model} Model
 * @param {Array<{ _id: unknown, name?: string, slug?: string }>} docs
 */
export async function backfillSlugsForModel(Model, docs) {
  const taken = new Set(
    (await Model.find({ slug: { $exists: true, $ne: "" } }).select("slug").lean()).map(
      (d) => d.slug,
    ),
  );

  let updated = 0;
  for (const doc of docs) {
    if (doc.slug) {
      taken.add(doc.slug);
      continue;
    }
    const slug = ensureUniqueSlug(slugifyName(doc.name) || "item", taken);
    await Model.updateOne({ _id: doc._id }, { $set: { slug } });
    updated += 1;
  }
  return updated;
}
