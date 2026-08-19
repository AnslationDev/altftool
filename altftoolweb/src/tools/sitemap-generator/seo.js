const seo = {
  title: "XML Sitemap Generator: Download sitemap.xml",
  metaDescription:
    "Add page URLs with lastmod, changefreq and priority, watch the sitemaps.org 0.9 XML update live, then copy it or download sitemap.xml for your site root.",
  steps: [
    "Enter a page in 'Page URL Address' (https:// is added if you leave the protocol off) and set its Crawling Priority, Change Frequency and Last Modified Date.",
    "Press 'Add URL to Sitemap' — the page joins the Configured Pages list and the XML in the File Preview updates live.",
    "Press Copy to grab the XML, or Download to save it as sitemap.xml for your site root.",
  ],
  intro:
    "The Sitemap Generator builds a valid XML sitemap against the sitemaps.org 0.9 schema, writing a <url> block for each page with its <loc>, <lastmod> date, <changefreq> and <priority>. You add URLs one at a time — the protocol is filled in as https:// if you leave it off — watch the XML update live, then copy it or download it as sitemap.xml to drop at your site root. It suits small and mid-sized sites and hand-built pages where no CMS is emitting a sitemap for you.",
  useCases: [
    "You have launched a ten-page static site with no CMS behind it and need a sitemap.xml to submit in Google Search Console before the pages get discovered on their own.",
    "A handful of new landing pages went live outside the main build and you want a supplementary sitemap listing just those, with today's date as lastmod.",
    "Your generated sitemap is being rejected and you want a known-good reference file to compare the element order and namespace against.",
  ],
  benefits: [
    ["Valid structure by construction", "The namespace, element order and nesting are written for you, so the common failures — a missing xmlns, tags in the wrong order — cannot happen."],
    ["The XML is visible while you build", "Every field you change is reflected in the output pane immediately, so you can see exactly what a lastmod or priority change does to the file."],
    ["Priority and changefreq as guided choices", "Priority is offered on the 0.1 to 1.0 scale with sensible labels and changefreq as the seven values the protocol actually permits, instead of free text a parser will reject."],
  ],
  faqs: [
    [
      "How many URLs can one sitemap file hold?",
      "50,000 URLs, or 50 MB uncompressed, whichever comes first — that is the sitemaps.org protocol limit. Larger sites split into multiple sitemap files referenced by a sitemap index file.",
    ],
    [
      "Where do I put sitemap.xml and how does Google find it?",
      "Put it at your site root, for example https://example.com/sitemap.xml, then either submit it in Google Search Console or add a `Sitemap:` line pointing to it in your robots.txt. A sitemap only has to cover URLs at or below its own directory level.",
    ],
    [
      "Do priority and changefreq actually affect ranking?",
      "No. Google has stated it ignores both — priority does not raise a page's ranking and changefreq does not control crawl frequency. They remain part of the schema and some other crawlers read them, which is why the fields are here, but lastmod is the value worth keeping accurate.",
    ],
    [
      "What date format does lastmod need?",
      "W3C Datetime — YYYY-MM-DD is the usual form, optionally with a time and timezone. Set it to the date the page's content genuinely changed; a lastmod that updates on every deploy while the content is unchanged teaches crawlers to stop trusting it.",
    ],
  ],
};

export default seo;
