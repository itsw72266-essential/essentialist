/**
 * @param {string} value
 */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * @param {import('./sitemapEntries').SitemapEntry[]} entries
 */
export function buildSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const entry of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);

    if (entry.lastModified) {
      lines.push(`    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`);
    }
    if (entry.changeFrequency) {
      lines.push(
        `    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`,
      );
    }
    if (entry.priority != null) {
      lines.push(`    <priority>${entry.priority}</priority>`);
    }

    const languages = entry.alternates?.languages;
    if (languages) {
      for (const [hreflang, href] of Object.entries(languages)) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`,
        );
      }
    }

    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}
