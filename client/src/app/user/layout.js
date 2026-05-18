import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("user", locale);
}

export default function UserLayout({ children }) {
  return children;
}
