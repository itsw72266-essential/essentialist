/**
 * Static local/informational SEO guides (publish without CMS).
 * @typedef {{ slug: string, title: string, description: string, keywords: string[], body: string[], faq: Array<{ q: string, a: string }>, links: Array<{ href: string, label: string }> }} SeoGuide
 */

/** @type {SeoGuide[]} */
export const LOCAL_SEO_GUIDES = [
  {
    slug: "cosmetic-shops-in-cameroon",
    title: "Cosmetic Shops in Cameroon | Authentic Makeup & Delivery",
    description:
      "Find trusted cosmetic shops in Cameroon. Essentialist in Douala stocks NYX, Smashbox, Bobbi Brown & more with XAF prices and nationwide delivery.",
    keywords: [
      "cosmetic shops in cameroon",
      "cosmetics shop cameroon",
      "makeup store cameroon",
      "beauty shop douala",
    ],
    body: [
      "Looking for cosmetic shops in Cameroon that stock authentic international brands? Essentialist Makeup Store in Douala carries professional makeup, skincare, and beauty tools from NYX, Smashbox, Bobbi Brown, e.l.f., and more.",
      "We publish transparent XAF prices on every product page, offer secure checkout, and deliver to Douala, Yaoundé, and cities nationwide. Visit our showroom or order online for the same authentic stock.",
      "Whether you need mascara, foundation, concealer kits, or full makeup sets, you can shop by brand, category, or search — with fast support via phone, WhatsApp, or email.",
    ],
    faq: [
      {
        q: "Where are cosmetic shops in Cameroon located?",
        a: "Essentialist is based in Douala with delivery across Cameroon. See our contact page for address, hours, and directions.",
      },
      {
        q: "Do you sell authentic branded cosmetics?",
        a: "Yes. We source authentic NYX, Smashbox, Bobbi Brown, and other listed brands with clear product photos and prices in FCFA.",
      },
    ],
    links: [
      { href: "/contact", label: "Visit Essentialist Douala" },
      { href: "/brands", label: "Shop makeup brands" },
      { href: "/brands/smashbox", label: "Smashbox mascara & makeup" },
      { href: "/brands/nyx", label: "NYX mascara & cosmetics" },
    ],
  },
  {
    slug: "essentialist-makeup-store-douala",
    title: "Essentialist Makeup Store Douala | Authentic Cosmetics",
    description:
      "Essentialist is a makeup store in Douala, Cameroon — authentic brands, XAF prices, in-store shopping & nationwide delivery.",
    keywords: [
      "essentialist makeup store douala",
      "makeup store douala",
      "cosmetic shop douala",
      "es makeup store",
    ],
    body: [
      "Essentialist Makeup Store is a dedicated beauty retailer in Douala, Cameroon. We specialize in authentic professional and everyday makeup with honest FCFA pricing on every product.",
      "Shop foundations, setting powders, mascaras, lip products, palettes, and kits from brands customers search for most — including NYX, Smashbox, and Bobbi Brown.",
      "Order online for delivery across Cameroon or contact us for shade matching and bulk beauty supply for events and salons.",
    ],
    faq: [
      {
        q: "What is Essentialist Makeup Store?",
        a: "A Cameroon-based cosmetics retailer in Douala offering authentic international makeup with online ordering and nationwide delivery.",
      },
      {
        q: "How do I buy from Essentialist in Douala?",
        a: "Browse products on our website, add to cart, and checkout — or visit/contact us via the contact page for in-person shopping.",
      },
    ],
    links: [
      { href: "/", label: "Shop makeup home" },
      { href: "/contact", label: "Store hours & location" },
      { href: "/new-arrival", label: "New arrivals" },
    ],
  },
  {
    slug: "smashbox-mascara-price-cameroon",
    title: "Smashbox Mascara Price in Cameroon | Buy in Douala",
    description:
      "Compare Smashbox mascara prices in Cameroon (XAF). Shop Super Fan and other Smashbox eye makeup with fast delivery from Essentialist Douala.",
    keywords: [
      "smashbox mascara",
      "smashbox mascara price",
      "smashbox super fan mascara",
      "buy smashbox cameroon",
    ],
    body: [
      "Smashbox mascara is one of the most searched eye makeup products in Cameroon. At Essentialist you will find current XAF prices on each Smashbox mascara PDP — no hidden fees.",
      "For the best match to your search, open our Smashbox brand page to compare all mascaras in stock, then select your shade for checkout and nationwide delivery.",
    ],
    faq: [
      {
        q: "How much is Smashbox mascara in Cameroon?",
        a: "Prices are listed in XAF on each product page and update with stock. Check the Smashbox brand page for all mascaras currently available.",
      },
      {
        q: "Is Smashbox mascara authentic at Essentialist?",
        a: "Yes. We sell authentic Smashbox products sourced for our Cameroon store with full product details and images.",
      },
    ],
    links: [
      { href: "/brands/smashbox", label: "Shop Smashbox makeup" },
      { href: "/eye-makeup/mascara", label: "All mascara Cameroon" },
    ],
  },
  {
    slug: "nyx-worth-the-hype-mascara-cameroon",
    title: "NYX Worth The Hype Mascara Cameroon | Price & Buy Douala",
    description:
      "Buy NYX Worth The Hype mascara in Cameroon. See XAF price, stock, and delivery from Essentialist — authentic NYX in Douala.",
    keywords: [
      "nyx worth the hype mascara",
      "nyx mascara cameroon",
      "nyx mascara price",
      "buy nyx douala",
    ],
    body: [
      "NYX Worth The Hype mascara is a volume and length favorite. Search the site for the exact product name or browse NYX mascaras on our brand page to find the matching listing with live XAF price.",
      "Essentialist ships NYX and other authentic brands from Douala to customers across Cameroon.",
    ],
    faq: [
      {
        q: "Where can I buy NYX Worth The Hype mascara in Cameroon?",
        a: "At Essentialist Makeup Store — order online with delivery or contact us for availability in Douala.",
      },
    ],
    links: [
      { href: "/brands/nyx", label: "Shop NYX cosmetics" },
      { href: "/eye-makeup/mascara", label: "Eye makeup mascara" },
    ],
  },
  {
    slug: "bobbi-brown-creamy-concealer-kit-cameroon",
    title: "Bobbi Brown Creamy Concealer Kit Cameroon | Essentialist",
    description:
      "Shop Bobbi Brown creamy concealer kit in Cameroon. Authentic Bobbi Brown concealer & complexion products with XAF pricing and delivery.",
    keywords: [
      "bobbi brown creamy concealer kit",
      "bobbi brown concealer cameroon",
      "bobbi brown makeup douala",
    ],
    body: [
      "Bobbi Brown creamy concealer kits are ideal for under-eye coverage and spot concealing. Essentialist lists authentic Bobbi Brown complexion products with shade details and Cameroon delivery.",
      "Use our Bobbi Brown brand page to explore concealers, foundations, and kits — each product page shows the price in XAF and stock status.",
    ],
    faq: [
      {
        q: "Does Essentialist sell Bobbi Brown concealer kits?",
        a: "Yes, when in stock. Browse the Bobbi Brown brand page or search the site for the exact kit name.",
      },
    ],
    links: [
      { href: "/brands/bobbi-brown", label: "Shop Bobbi Brown" },
      { href: "/face-makeup/concealer", label: "Concealer makeup" },
    ],
  },
  {
    slug: "maquillage-et-cosmetiques-douala",
    title: "Maquillage & Produits Cosmétiques Douala | Essentialist",
    description:
      "Boutique maquillage à Douala, Cameroun — produits cosmétiques authentiques, prix FCFA, livraison nationale.",
    keywords: [
      "maquillage",
      "produits cosmétiques",
      "cosmétique douala",
      "boutique maquillage cameroun",
    ],
    body: [
      "Essentialist est votre boutique de maquillage et produits cosmétiques à Douala. Fond de teint, mascara, rouge à lèvres, palettes et kits des grandes marques internationales.",
      "Prix affichés en FCFA, paiement sécurisé et livraison à Douala, Yaoundé et dans tout le Cameroun.",
    ],
    faq: [
      {
        q: "Où acheter du maquillage authentique à Douala ?",
        a: "Chez Essentialist — en ligne ou via notre page contact pour la boutique.",
      },
    ],
    links: [
      { href: "/contact", label: "Contact & adresse Douala" },
      { href: "/brands", label: "Marques maquillage" },
    ],
  },
];

/** @param {string} slug */
export function getLocalSeoGuide(slug) {
  return LOCAL_SEO_GUIDES.find((g) => g.slug === slug) ?? null;
}

export function getAllLocalSeoGuideSlugs() {
  return LOCAL_SEO_GUIDES.map((g) => g.slug);
}
