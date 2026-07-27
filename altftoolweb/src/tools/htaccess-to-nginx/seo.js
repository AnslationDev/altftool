const seo = {
  intro:
    "This converter reads an Apache .htaccess file and emits the equivalent NGINX directives: RewriteRule becomes rewrite, RewriteCond becomes an if or a try_files, %{HTTP_HOST} becomes $host, ErrorDocument becomes error_page and <FilesMatch> becomes a location block. It is for anyone moving a WordPress, Laravel or plain PHP site from Apache to NGINX, where per-directory .htaccess files simply do not exist. Anything that cannot be translated faithfully is emitted as a comment with a note, rather than as a guess.",
  useCases: [
    "Port a WordPress .htaccess to an NGINX server block before switching a site over from Apache.",
    "Turn a long list of Redirect 301 lines into location = / return 301 blocks in one pass.",
    "Check how an existing HTTPS-forcing RewriteCond should be written as an NGINX return 301.",
  ],
  benefits: [
    ["Path anchoring handled", "Anchored patterns gain the leading slash, because NGINX matches the URI while .htaccess matches a relative path."],
    ["Idioms, not literal translation", "The !-f / !-d front-controller pair becomes a single try_files instead of an unusable if."],
    ["Honest about the gaps", "Multiple RewriteCond lines, [P] proxying and php_value are flagged for manual work rather than mistranslated."],
  ],
  faqs: [
    [
      "Does NGINX support .htaccess files?",
      "No. NGINX reads its configuration once when it starts or reloads, so there is no per-directory override file. Every rule has to move into a server or location block, which is why a conversion step is needed at all.",
    ],
    [
      "How does RewriteRule map to NGINX rewrite?",
      "The pattern gains a leading slash and the flags change: [R=301] becomes permanent, [R] or [R=302] becomes redirect, and [L] becomes last. So RewriteRule ^old/(.*)$ /new/$1 [R=301,L] becomes rewrite ^/old/(.*)$ /new/$1 permanent;.",
    ],
    [
      "What replaces the WordPress !-f / !-d rewrite block?",
      "A single try_files line: try_files $uri $uri/ /index.php?$query_string;. It tests for the file then the directory then falls through to the front controller, which is exactly what the two RewriteCond lines did, and it costs less than an if.",
    ],
    [
      "Why can't several RewriteCond lines be converted automatically?",
      "Because NGINX has no way to AND conditions in one if, and if blocks cannot be nested. Two or more conditions on one rule normally have to be rewritten with a map block that combines the variables into one, so the tool flags them instead of guessing.",
    ],
  ],
};

export default seo;
