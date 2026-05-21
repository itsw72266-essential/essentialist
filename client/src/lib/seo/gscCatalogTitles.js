/**
 * Search Console–aligned commercial titles and keywords for catalog pages.
 */

const CATEGORY_SEO = {
  "face makeup": "Face Makeup Kits & Foundation Cameroon",
  "eye makeup": "Eye Makeup, Mascara & Eyeshadow Cameroon",
  "lip makeup": "Lip Makeup, Lipstick & Lip Gloss Cameroon",
  "foundation makeup": "Foundation Makeup & Shade Finder Cameroon",
  "setting powder": "Setting Powder & Face Powder Cameroon",
  "blush makeup": "Blush & Cheek Tint Makeup Cameroon",
  "makeup sets": "Makeup Sets & Starter Kits Cameroon",
  "makeup kits": "Makeup Kits & Travel Essentials Cameroon",
  "makeup palettes": "Makeup Palettes & Eyeshadow Sets Cameroon",
  maquillage: "Maquillage Authentique au Cameroun",
  "produits cosmétiques": "Produits Cosmétiques Douala Cameroun",
  cosmétique: "Cosmétiques & Maquillage Douala",
  makeup: "Authentic Makeup Store Cameroon",
};

const SUBCATEGORY_COMMERCIAL = {
  Foundation: "Transfer Proof Foundation For Masks",
  "Foundation Makeup": "Foundation Shade Finder Kit",
  "Liquid Foundation": "Lightweight Liquid Foundation For Acne Prone Skin",
  "Powder Foundation": "Buildable Powder Foundation For Mature Skin",
  "Stick foundation": "Stick Foundation For Oily Skin",
  "Total Control Drop Foundation": "Drop Foundation Full Coverage Adjustable",
  "Foundation Primers": "Gripping Primer For Long Wear Makeup",
  "Face Primer": "Pore Blurring Primer For Oily Skin",
  "Tinted Moisturizer": "Tinted Moisturizer With SPF For Oily Skin",
  "Setting Spray": "Alcohol Free Setting Spray For Dry Skin",
  "SETTING POWDER": "No Flashback Setting Powder",
  "All Setting Powder": "Translucent Setting Powder For Oily Skin",
  Concealer: "Full Coverage Concealer For Dark Circles",
  "Concealers & Neutralizers": "Peach Color Corrector For Dark Circles",
  "Dark circle concealer": "Orange Concealer For Dark Circles",
  "Blush Makeup": "Cream Blush For Mature Skin",
  "All Blush": "Best Affordable Blush For Fair Skin",
  "High Definition Blush": "HD Cream Blush For Camera Ready Look",
  "Highlighters & Luminizers": "Subtle Highlighter For Mature Skin",
  Illuminator: "Liquid Illuminator Under Foundation",
  "Liquid highlighter": "Dewy Liquid Highlighter For Natural Glow",
  Bronzy: "Subtle Bronzy Makeup Look Products",
  "Bronzy Powder": "Warm Bronzer Powder For Olive Skin",
  Bronzer: "Matte Bronzer For Fair Cool Undertone",
  "Matte bronzer": "Matte Bronzer For Fair Cool Undertone",
  "Eye Makeup": "Everyday Eye Makeup Kit For Beginners",
  "Eye Shadow": "Neutral Eyeshadow For Blue Eyes",
  "Eye Shadow Palette": "Mini Eyeshadow Palette For Travel",
  Eyeliner: "Smudge Proof Eyeliner For Oily Lids",
  Kajal: "Long Lasting Kajal For Watery Eyes",
  Mascara: "NYX & Smashbox Mascara Price Cameroon",
  "Eye Cream & Treatment": "Eye Cream For Dark Circles",
  "EYE CREAM": "Fragrance Free Eye Cream For Sensitive Skin",
  "Eye Serum": "Retinol Eye Serum For Fine Lines",
  "Eye brow cake powder": "NYX Eyebrow Cake Powder Cameroon",
  "Eye Brow Enhancers": "Tinted Brow Gel For Thin Eyebrows",
  "Lip Makeup": "Lip Makeup Set Gift For Her",
  Lipstick: "Transfer Proof Lipstick For Weddings",
  "Liquid Lipstick": "Comfortable Liquid Lipstick Non Drying",
  "Matte Lip Sticks": "Matte Lipstick Set Nude",
  "Lip Gloss": "Non Sticky Lip Gloss Set",
  "Lip Lacquer": "NYX Slip Tease Lip Lacquer Cameroon",
  "Lip Liner": "Waterproof Lip Liner Nude Shades",
  "Lip Plumper": "Cinnamon Lip Plumper Gloss",
  "Lip Tint": "Long Lasting Lip Tint Waterproof",
  "Lip Crayon": "Matte Lip Crayon Non Drying",
  "Lip cream": "Long Lasting Lip Cream Matte Finish",
  "Lip Cream Pallette": "Lip Cream Palette Professional",
  "Lip/eye liner pencil 3 in 1": "3 In 1 Lip Eye Liner Pencil Set",
  "Makeup Palettes": "All In One Makeup Palette With Mirror",
  "Makeup Sets": "Beginner Makeup Set With Bag",
  "Makeup Kits": "Travel Makeup Kit Essentials",
  "Face Makeup": "Beginner Face Makeup Kit With Brushes",
  Compact: "Compact Powder For Oily Skin Long Lasting",
  "Loose Powder": "Talc Free Loose Setting Powder",
};

/** Extra SERP phrases by brand slug (lowercase). */
const BRAND_QUERY_PHRASES = {
  nyx: ["nyx mascara", "nyx foundation stick", "nyx cosmetics", "nyx makeup kit"],
  smashbox: ["smashbox mascara", "smashbox mascara price", "super fan mascara"],
  "bobbi-brown": ["bobbi brown creamy concealer kit", "bobbi brown skin foundation"],
  "bobbi brown": ["bobbi brown creamy concealer kit", "bobbi brown skin foundation"],
  "estee-lauder": ["estee lauder double wear concealer", "estee lauder makeup"],
  "e-l-f": ["elf makeup", "elf cosmetics"],
  elf: ["elf makeup", "elf cosmetics"],
  "laura-geller": ["laura geller double take foundation", "laura geller makeup"],
  "juvias-place": ["juvia's place highlighter", "juvia's place blush"],
  "one-size": ["one size setting spray", "on til dawn setting spray"],
  mac: ["mac studio fix powder", "mac powder foundation"],
  clinique: ["clinique eye cream", "clinique smart clinical repair eye cream"],
};

function toKey(s = "") {
  return String(s).trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * @param {string} categoryName
 */
export function getCategorySeoTitle(categoryName = "") {
  const key = toKey(categoryName);
  if (CATEGORY_SEO[key]) return CATEGORY_SEO[key];
  const match = Object.keys(CATEGORY_SEO).find(
    (k) => k.toLowerCase() === key,
  );
  if (match) return CATEGORY_SEO[match];
  return `${categoryName} Essentials Cameroon`;
}

/**
 * @param {string} subCategoryName
 */
export function getSubCategoryCommercialTitle(subCategoryName = "") {
  if (SUBCATEGORY_COMMERCIAL[subCategoryName]) {
    return SUBCATEGORY_COMMERCIAL[subCategoryName];
  }
  const key = Object.keys(SUBCATEGORY_COMMERCIAL).find(
    (k) => k.toLowerCase() === String(subCategoryName).toLowerCase(),
  );
  if (key) return SUBCATEGORY_COMMERCIAL[key];
  return `${subCategoryName} Essentials Cameroon`;
}

/**
 * @param {string} brandSlug
 * @param {string} brandName
 */
export function getBrandQueryPhrases(brandSlug = "", brandName = "") {
  const slug = String(brandSlug || brandName)
    .toLowerCase()
    .replace(/\s+/g, "-");
  return BRAND_QUERY_PHRASES[slug] || BRAND_QUERY_PHRASES[slug.replace(/-/g, " ")] || [];
}

/**
 * Pick up to 3 subcategory labels for brand title.
 * @param {string[]} subCategories
 */
export function formatBrandProductTypes(subCategories = []) {
  const items = (subCategories || []).filter(Boolean).slice(0, 3);
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}
