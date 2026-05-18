<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap — Essentialist Makeup Store</title>
        <style type="text/css">
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 24px;
            background: #fafafa;
            color: #1f2937;
            line-height: 1.5;
          }
          .wrap { max-width: 1200px; margin: 0 auto; }
          header {
            background: linear-gradient(135deg, #831843 0%, #db2777 100%);
            color: #fff;
            padding: 28px 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 4px 14px rgba(219, 39, 119, 0.25);
          }
          header h1 { margin: 0 0 8px; font-size: 1.5rem; font-weight: 700; }
          header p { margin: 0; opacity: 0.92; font-size: 0.95rem; }
          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 20px;
            font-size: 0.875rem;
            color: #6b7280;
          }
          .meta span {
            background: #fff;
            padding: 8px 14px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .meta strong { color: #831843; }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }
          th {
            text-align: left;
            background: #fdf2f8;
            color: #831843;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 12px 16px;
            border-bottom: 2px solid #fbcfe8;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 0.875rem;
            vertical-align: top;
          }
          tr:hover td { background: #fdf2f8; }
          a { color: #db2777; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .langs { display: flex; flex-wrap: wrap; gap: 6px; }
          .tag {
            display: inline-block;
            font-size: 0.7rem;
            padding: 2px 8px;
            border-radius: 999px;
            background: #fce7f3;
            color: #9d174d;
            white-space: nowrap;
          }
          .tag.fr { background: #dbeafe; color: #1e40af; }
          .tag.default { background: #f3f4f6; color: #4b5563; }
          footer {
            margin-top: 24px;
            font-size: 0.8rem;
            color: #9ca3af;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <h1>XML Sitemap</h1>
            <p>Essentialist Makeup Store — English &amp; French URLs for search engines</p>
          </header>

          <p class="meta">
            <span><strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs</span>
            <span>EN + FR linked via <code>hreflang</code></span>
            <span>For Google: submit <strong>/sitemap.xml</strong> only</span>
          </p>

          <table>
            <thead>
              <tr>
                <th style="width:42%">URL</th>
                <th>Last modified</th>
                <th>Frequency</th>
                <th>Priority</th>
                <th>Languages</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:sort select="sitemap:loc"/>
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  </td>
                  <td><xsl:value-of select="sitemap:changefreq"/></td>
                  <td><xsl:value-of select="sitemap:priority"/></td>
                  <td>
                    <div class="langs">
                      <xsl:for-each select="xhtml:link">
                        <span>
                          <xsl:attribute name="class">
                            <xsl:text>tag </xsl:text>
                            <xsl:if test="@hreflang = 'fr' or @hreflang = 'fr-CM'">fr</xsl:if>
                            <xsl:if test="@hreflang = 'x-default'">default</xsl:if>
                          </xsl:attribute>
                          <xsl:value-of select="@hreflang"/>
                        </span>
                      </xsl:for-each>
                    </div>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            Cosmetic view for humans — crawlers read the raw XML. Generated by Essentialist.
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
