import { buildSitemapXml } from "@/lib/seo/buildSitemapXml";
import { getSitemapEntries } from "@/lib/seo/sitemapEntries";

export async function GET() {
  const entries = await getSitemapEntries();
  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate",
    },
  });
}
