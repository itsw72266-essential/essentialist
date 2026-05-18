import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("login", locale);
}

export default function LoginLayout({ children }) {
  return children;
}
