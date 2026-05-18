import { buildPageMetadata } from "@/lib/seo/buildMetadata";

const PAGES = {
  contact: {
    en: {
      title:
        "Contact Essentialist Makeup Store | Customer Service in Cameroon",
      description:
        "Contact Essentialist Makeup Store for beauty advice, product inquiries, and order support in Cameroon. Phone, email, or visit our Douala store.",
      keywords: [
        "makeup store contact",
        "beauty customer service Cameroon",
        "cosmetics help Douala",
        "Essentialist contact",
      ],
    },
    fr: {
      title:
        "Contactez Essentialist | Service client maquillage au Cameroun",
      description:
        "Contactez Essentialist pour conseils beauté, commandes et support au Cameroun. Téléphone, e-mail ou boutique à Douala.",
      keywords: [
        "contact maquillage Cameroun",
        "service client cosmétiques",
        "boutique maquillage Douala",
        "Essentialist contact",
      ],
    },
  },
  blog: {
    en: {
      title:
        "Beauty Tips, Makeup Tutorials & Updates | Essentialist Blog",
      description:
        "Beauty trends, makeup tutorials, skincare advice, and store updates from Essentialist in Cameroon.",
      keywords: [
        "beauty blog cameroon",
        "makeup tutorials",
        "beauty tips douala",
        "cosmetics blog",
      ],
    },
    fr: {
      title:
        "Conseils beauté, tutoriels maquillage | Blog Essentialist",
      description:
        "Tendances beauté, tutoriels maquillage et conseils soins par Essentialist au Cameroun.",
      keywords: [
        "blog beauté Cameroun",
        "tutoriels maquillage",
        "conseils beauté Douala",
        "blog cosmétiques",
      ],
    },
  },
  brands: {
    en: {
      title: "Shop Top Makeup Brands in Cameroon | Essentialist",
      description:
        "Discover authentic cosmetic brands at Essentialist. Compare prices, shop skincare and makeup, fast delivery nationwide.",
      keywords: [
        "makeup brands Cameroon",
        "cosmetic brands Douala",
        "NYX Cameroon",
        "authentic cosmetics",
      ],
    },
    fr: {
      title: "Marques de maquillage au Cameroun | Essentialist",
      description:
        "Découvrez les marques cosmétiques authentiques chez Essentialist. Comparez, achetez, livraison rapide.",
      keywords: [
        "marques maquillage Cameroun",
        "cosmétiques Douala",
        "marques beauté authentiques",
      ],
    },
  },
  "new-arrival": {
    en: {
      title: "Newest Makeup Arrivals Cameroon | Essentialist Store",
      description:
        "Shop the latest makeup launches in Cameroon. Authentic brands, fast delivery in Douala and nationwide.",
      keywords: [
        "new makeup Cameroon",
        "new arrivals cosmetics",
        "latest beauty products Douala",
      ],
    },
    fr: {
      title: "Nouveautés maquillage Cameroun | Essentialist",
      description:
        "Les dernières nouveautés maquillage au Cameroun. Produits authentiques, livraison rapide.",
      keywords: [
        "nouveautés maquillage Cameroun",
        "nouveaux cosmétiques",
        "tendances beauté Douala",
      ],
    },
  },
  reviews: {
    en: {
      title: "Customer Reviews | Essentialist Makeup Store",
      description:
        "Read verified customer reviews about Essentialist products, shipping, and support in Cameroon.",
      keywords: [
        "Essentialist reviews",
        "makeup store reviews Cameroon",
        "customer testimonials",
      ],
    },
    fr: {
      title: "Avis clients | Essentialist Makeup Store",
      description:
        "Lisez les avis vérifiés sur les produits, la livraison et le service Essentialist au Cameroun.",
      keywords: [
        "avis Essentialist",
        "avis maquillage Cameroun",
        "témoignages clients",
      ],
    },
  },
  search: {
    en: {
      title: "Search Makeup & Cosmetics | Essentialist",
      description:
        "Search authentic makeup and beauty products at Essentialist Makeup Store in Cameroon.",
      keywords: ["search makeup", "find cosmetics Cameroon", "beauty search"],
    },
    fr: {
      title: "Rechercher maquillage & cosmétiques | Essentialist",
      description:
        "Recherchez des produits de maquillage authentiques chez Essentialist au Cameroun.",
      keywords: [
        "recherche maquillage",
        "trouver cosmétiques Cameroun",
      ],
    },
  },
  cart: {
    en: {
      title: "Your Cart | Essentialist Makeup Store",
      description: "Review items in your Essentialist shopping cart.",
      noindex: true,
    },
    fr: {
      title: "Votre panier | Essentialist",
      description: "Consultez les articles dans votre panier Essentialist.",
      noindex: true,
    },
  },
  checkout: {
    en: {
      title: "Checkout | Essentialist Makeup Store",
      description: "Complete your Essentialist order securely.",
      noindex: true,
    },
    fr: {
      title: "Paiement | Essentialist",
      description: "Finalisez votre commande Essentialist en toute sécurité.",
      noindex: true,
    },
  },
  login: {
    en: {
      title: "Login | Essentialist Makeup Store",
      description: "Sign in to your Essentialist account.",
      noindex: true,
    },
    fr: {
      title: "Connexion | Essentialist",
      description: "Connectez-vous à votre compte Essentialist.",
      noindex: true,
    },
  },
  register: {
    en: {
      title: "Register | Essentialist Makeup Store",
      description: "Create your Essentialist account.",
      noindex: true,
    },
    fr: {
      title: "Inscription | Essentialist",
      description: "Créez votre compte Essentialist.",
      noindex: true,
    },
  },
  orders: {
    en: {
      title: "My Orders | Essentialist",
      description: "View your Essentialist order history.",
      noindex: true,
    },
    fr: {
      title: "Mes commandes | Essentialist",
      description: "Consultez l'historique de vos commandes Essentialist.",
      noindex: true,
    },
  },
  user: {
    en: {
      title: "My Account | Essentialist",
      description: "Manage your Essentialist account.",
      noindex: true,
    },
    fr: {
      title: "Mon compte | Essentialist",
      description: "Gérez votre compte Essentialist.",
      noindex: true,
    },
  },
};

/** @param {keyof typeof PAGES} pageKey */
export function getStaticPageMetadata(pageKey, locale = "en") {
  const lang = locale === "fr" ? "fr" : "en";
  const copy = PAGES[pageKey]?.[lang] || PAGES[pageKey]?.en;
  const path = pageKey === "home" ? "/" : `/${pageKey}`;

  return buildPageMetadata({
    path,
    locale: lang,
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords || [],
    noindex: Boolean(copy.noindex),
  });
}
