const seo = {
  title: "Nginx Gzip & Brotli Compression Config Generator",
  metaDescription:
    "Generate nginx gzip and brotli directives with real module defaults, tuned levels and MIME lists — and no duplicate text/html warning.",
  steps: [
    "Tick Enable gzip and Enable brotli, then set gzip_comp_level (1-9, default 1, recommended 6) and brotli_comp_level (0-11, recommended 5).",
    "Choose MIME type groups (Text & CSS, JavaScript, JSON & manifests, XML & feeds, SVG images) and a minimum response size in bytes — nginx's default is 20, 256+ recommended.",
    "Click Copy config to grab the generated http/server-block snippet, then validate with nginx -t and reload; text/html is deliberately left out of the type lists.",
  ],
  intro:
    "This generator writes ready-to-paste nginx compression directives from the ngx_http_gzip_module and ngx_brotli modules — gzip on, gzip_comp_level, gzip_min_length, gzip_types and their brotli equivalents — from a set of checkboxes. It knows the real defaults (gzip level 1, minimum length 20 bytes, brotli level 6), keeps text/html out of the type lists to avoid nginx's duplicate MIME type warning, and flags settings that waste CPU for negligible size gains.",
  useCases: [
    "A developer enabling gzip on a fresh nginx install who wants a sane MIME type list without copying an outdated blog snippet",
    "An ops engineer adding brotli via ngx_brotli and needing matching brotli_types and brotli_comp_level directives alongside existing gzip config",
    "A performance audit fix: raising gzip_comp_level from the default 1 to 6 and gzip_min_length from 20 to 256 bytes in one reviewed snippet",
  ],
  benefits: [
    ["Real module defaults", "Levels and ranges match the nginx docs: gzip 1-9 (default 1), brotli 0-11 (default 6), gzip_min_length default 20."],
    ["No duplicate-MIME warning", "text/html is always compressed by nginx, so the generator never repeats it in gzip_types or brotli_types."],
    ["CPU-cost warnings", "Choosing gzip level 9 or a tiny min_length adds notes explaining the trade-off before you deploy it."],
  ],
  faqs: [
    [
      "What gzip_comp_level should I use in nginx?",
      "Level 5 or 6 is the usual sweet spot — nginx's default is only 1, and levels above 6 cost noticeably more CPU for roughly 1% smaller output. Level 9 only makes sense for pre-compressing static files offline, which gzip_static then serves with zero runtime cost.",
    ],
    [
      "Why is text/html missing from the generated gzip_types list?",
      "Because nginx always compresses text/html when gzip is on — it is the built-in default for gzip_types — and listing it again makes nginx log a 'duplicate MIME type \"text/html\"' warning. The generator deliberately strips it from every type list.",
    ],
    [
      "What is a good gzip_min_length value?",
      "Around 256 bytes or higher. The nginx default is 20 bytes, but responses smaller than roughly one TCP segment gain nothing from compression and very small payloads can even grow because of gzip's ~20-byte header overhead.",
    ],
    [
      "Does nginx support brotli out of the box?",
      "No — brotli requires the ngx_brotli module, installed as libnginx-mod-http-brotli on Debian and Ubuntu or compiled in with --add-module. Once loaded, brotli_comp_level 4-6 is recommended for on-the-fly compression, while level 11 is best kept for pre-compressed .br files served by brotli_static.",
    ],
  ],
};

export default seo;
