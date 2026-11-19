// src/app/offers/page.jsx
import SummaryApi, { apiFetch } from "@/backend/contracts/summaryApi";
import { cacheLife, cacheTag } from "next/cache";
import DiscountedProductsContent from "../../components/DiscountedProductsContent";
import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

const HERO_TITLE = "Makeup Offers & Deals";
const HERO_SUBTITLE = "Save on Your Favorite Beauty Products";
const HERO_DESCRIPTION =
  "Shop our current makeup deals in Cameroon. Authentic brands at discounted FCFA prices, while stocks last.";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("offers", locale);
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];

  return products.map((product) => {
    if (!product || typeof product !== "object") return product;

    const brandData = product.brand;
    const brandName = typeof brandData === "string" ? brandData : (brandData?.name || "");

    return {
      ...product,
      brand: brandName,
      image: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
    };
  });
}

export default async function OffersPage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("offers");

  const res = await apiFetch(SummaryApi.getProduct.url, {
    method: "POST",
    body: {
      limit: 100,
      page: 1,
      sort: "discountDesc",
      onlyActive: true,
      filters: { discount: { min: 1, max: 49 } },
    },
    cache: "force-cache",
  });

  const products = res?.data?.products || res?.data?.items || res?.data || res?.products || [];
  const normalized = normalizeProducts(products);

  return (
    <DiscountedProductsContent
      hero={{ title: HERO_TITLE, subtitle: HERO_SUBTITLE, description: HERO_DESCRIPTION }}
      products={normalized}
      emptyMessage="No active offers right now. Check back soon!"
    />
  );
}
