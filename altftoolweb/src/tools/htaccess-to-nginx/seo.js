const seo = {
  title: ".htaccess to NGINX Converter — Free Rewrite Rules",
  h1: ".htaccess to NGINX Converter",
  metaDescription:
    "Paste an Apache .htaccess and get NGINX directives — RewriteRule to rewrite, %{HTTP_HOST} to $host, !-f/!-d to try_files. Free, runs in your browser.",
  intro:
    "This .htaccess to NGINX converter parses your Apache file line by line with a purpose-built directive parser and emits the NGINX equivalent: RewriteRule becomes rewrite, the 17 mapped mod_rewrite server variables (%{HTTP_HOST}, %{REQUEST_URI}, %{QUERY_STRING} and the rest) become $host, $request_uri and $args, ErrorDocument becomes error_page, and <FilesMatch> becomes a location block. It also recognises three Apache idioms and writes them the NGINX way instead of translating them literally — the !-f / !-d front-controller pair collapses into a single try_files, the %{HTTPS} off condition becomes a return 301, and the strip-www rule becomes a host-matching if. The conversion runs in your browser as you type, so the config is never uploaded, and anything with no faithful NGINX equivalent is emitted as a commented line plus a warning rather than a guess.",
  useCases: [
    "Moving a WordPress, Laravel or plain PHP site off Apache and needing the .htaccess rules rewritten as an NGINX server block.",
    "Turning a page of Redirect 301 lines into location = /old { return 301 /new; } blocks in a single paste.",
    "Checking how one rule — a forced-HTTPS redirect, a strip-www redirect, a front-controller fallback — should actually be written in NGINX before you hand-edit the config.",
  ],
  benefits: [
    [
      "Idioms, not literal translation",
      "The !-f / !-d front-controller pair becomes one try_files, the %{HTTPS} off rule becomes a return 301, and the strip-www rule becomes an if on $host — the forms NGINX admins actually write.",
    ],
    [
      "Path anchoring handled",
      "Anchored patterns gain the leading slash they need, because .htaccess matches a per-directory path without it while NGINX always matches a normalised URI starting with \"/\".",
    ],
    [
      "Honest about the gaps",
      "Multiple RewriteCond lines, the [P] proxy flag, php_value and RewriteBase are flagged as review notes instead of being mistranslated, and unconvertible lines are kept as comments at the bottom.",
    ],
    [
      "Nothing leaves your browser",
      "The parser is JavaScript running on your own machine — the .htaccess text is never uploaded, and there is no account, no limit and no charge.",
    ],
  ],
  faqs: [
    [
      "Does NGINX support .htaccess files?",
      "No. NGINX reads its configuration once at start-up or reload, so there is no per-directory override file the way Apache has one. Every rule has to move into a server or location block, which is exactly why a conversion step is needed.",
    ],
    [
      "How does RewriteRule map to an NGINX rewrite?",
      "The pattern gains a leading slash and the flags change: [R=301] becomes permanent, [R] or [R=302] becomes redirect, [L] or [END] becomes last, [F] becomes return 403 and [G] becomes return 410. So RewriteRule ^old/(.*)$ /new/$1 [R=301,L] converts to rewrite ^/old/(.*)$ /new/$1 permanent;.",
    ],
    [
      "What replaces the WordPress !-f / !-d rewrite block in NGINX?",
      "A single line: try_files $uri $uri/ /index.php?$query_string;. The converter detects the RewriteCond %{REQUEST_FILENAME} !-f and !-d pair and collapses it into try_files, which tests the file, then the directory, then falls through to the front controller — the same behaviour, and cheaper than an if.",
    ],
    [
      "Is this htaccess to nginx converter free, and does my config get uploaded?",
      "Yes, free with no signup, and nothing is uploaded. The whole conversion runs as JavaScript in your browser, so the text you paste stays on your device and is never sent to a server or stored. The only limit is a 200,000-character input, which keeps the single-pass parser responsive.",
    ],
    [
      "Why won't it convert several RewriteCond lines on one rule?",
      "Because NGINX cannot AND conditions inside a single if, and if blocks cannot be nested. Two or more conditions on one rule usually have to be folded into a map block that combines the variables first, so the tool emits each condition and raises a review note instead of guessing at a merge.",
    ],
    [
      "Can I paste the output straight into nginx.conf and reload?",
      "No — treat it as a starting point. The output is prefixed with a review warning, and some conversions deliberately lose context: an [F] or [G] rule becomes its own location block, which cannot carry the RewriteCond lines that preceded it. Read the \"Read before you reload\" notes, fix the flagged lines, then run nginx -t before reloading.",
    ],
    [
      "What happens to ExpiresByType, Header and other non-rewrite directives?",
      "They convert too, with one caveat on caching. ExpiresByType image/jpeg \"access plus 1 year\" becomes location ~* \\.(jpg|jpeg)$ { expires 1y; }, because NGINX matches locations on the URI rather than on the MIME type — types with no obvious file extension are skipped with a note. Header always set X-Frame-Options \"SAMEORIGIN\" becomes add_header X-Frame-Options \"SAMEORIGIN\" always;, and DirectoryIndex, ErrorDocument, AddType, AddDefaultCharset, FileETag, LimitRequestBody and Options -Indexes each map to their NGINX counterpart.",
    ],
    [
      "What can't be converted automatically?",
      "Four things are reported rather than translated: php_value and php_flag settings (move them to php.ini, the PHP-FPM pool, or a fastcgi_param PHP_VALUE), the [P] proxy flag (use proxy_pass in a location block), <Limit> and <LimitExcept> (use limit_except), and RewriteBase, which has no equivalent because the rewrite targets are already absolute. Any directive the parser doesn't recognise is collected at the bottom of the output as a comment and counted under \"Lines needing manual work\".",
    ],
  ],
  steps: [
    "Paste your .htaccess into the box — a sample WordPress-style file is loaded so you can see the conversion immediately.",
    "Set server_name and root, or untick the server block wrapper if you only want the bare directives to drop into an existing config.",
    "Read the review notes, copy the generated config, and run nginx -t before you reload.",
  ],
};

export default seo;
