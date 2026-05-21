import { buildProductPath } from "@/lib/catalogSlugs";

/** GSC query → display anchor when product name matches. */
const GSC_PRODUCT_ANCHORS = [
  { test: /worth the hype/i, label: "NYX Worth The Hype Mascara" },
  { test: /super fan/i, label: "Smashbox Super Fan Mascara" },
  { test: /slip tease/i, label: "NYX Slip Tease Lip Lacquer" },
  { test: /creamy concealer kit/i, label: "Bobbi Brown Creamy Concealer Kit" },
  { test: /eyebrow cake/i, label: "NYX Eyebrow Cake Powder" },
  { test: /double wear/i, label: "Estée Lauder Double Wear Concealer" },
  { test: /studio fix/i, label: "MAC Studio Fix Powder" },
  { test: /on 'til dawn|on til dawn/i, label: "One Size On 'Til Dawn Setting Spray" },
  { test: /mascara/i, label: null },
  { test: /concealer/i, label: null },
];

/**
 * @param {string} name
 * @param {string} [brandName]
 */
export function gscAnchorLabelForProduct(name = "", brandName = "") {
  const haystack = `${brandName} ${name}`.trim();
  for (const { test, label } of GSC_PRODUCT_ANCHORS) {
    if (!test.test(haystack)) continue;
    if (label) return label;
    if (brandName && /mascara/i.test(haystack)) {
      return `${brandName} Mascara`;
    }
    if (brandName && /concealer/i.test(haystack)) {
      return `${brandName} Concealer`;
    }
    break;
  }
  return name;
}

/**
 * @param {Array<{ _id?: string, name?: string, slug?: string, stock?: number, brand?: { name?: string, slug?: string }, brandName?: string }>} products
 * @param {number} [limit]
 */
export function pickPopularProductLinks(products = [], limit = 6) {
  if (!Array.isArray(products)) return [];
  const sorted = [...products].sort(
    (a, b) => Number(b?.stock ?? 0) - Number(a?.stock ?? 0),
  );
  return sorted
    .filter((p) => p?._id && p?.name)
    .slice(0, limit)
    .map((p) => {
      const brandName =
        p.brandName ||
        (typeof p.brand === "object" ? p.brand?.name : "") ||
        "";
      return {
        href: buildProductPath(p),
        label: gscAnchorLabelForProduct(p.name, brandName),
      };
    });
}

/**
 * Unique brand shop links from a product list.
 * @param {Array<{ brand?: { _id?: string, name?: string, slug?: string }, brandName?: string, brandSlug?: string }>} products
 * @param {number} [limit]
 */
export function pickBrandLinksFromProducts(products = [], limit = 4) {
  if (!Array.isArray(products)) return [];
  const seen = new Set();
  const links = [];
  for (const p of products) {
    const slug =
      p.brandSlug ||
      (typeof p.brand === "object" ? p.brand?.slug : null);
    const name =
      p.brandName ||
      (typeof p.brand === "object" ? p.brand?.name : null);
    if (!slug || !name || seen.has(slug)) continue;
    seen.add(slug);
    links.push({
      href: `/brands/${slug}`,
      label: `Shop ${name}`,
    });
    if (links.length >= limit) break;
  }
  return links;
}
