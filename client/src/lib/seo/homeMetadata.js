export const HOME_METADATA = {
  en: {
    title:
      "Best Makeup Store in Cameroon | Essentialist — Shop NYX, Smashbox, Bobbi Brown in Douala",
    description:
      "Shop authentic makeup and cosmetic products in Cameroon. Professional makeup, setting powders, foundations, and more. Fast delivery to Douala and nationwide.",
    openGraphLocale: "en_US",
  },
  fr: {
    title:
      "Meilleure boutique maquillage au Cameroun | Essentialist — Douala",
    description:
      "Maquillage et cosmétiques authentiques au Cameroun. Poudres, fonds de teint, rouges à lèvres et plus. Livraison rapide à Douala et partout au pays.",
    openGraphLocale: "fr_CM",
  },
};

export function getHomeMetadata(locale) {
  return locale === "fr" ? HOME_METADATA.fr : HOME_METADATA.en;
}
