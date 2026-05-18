import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("contact", locale);
}

export default function ContactLayout({ children }) {
  return children;
}
