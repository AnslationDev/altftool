const seo = {
  title: "HTML to PHP Converter: Escaped Echo Placeholders",
  metaDescription:
    "Turn {{ placeholders }} into htmlspecialchars($var, ENT_QUOTES, 'UTF-8') echoes with a strict_types block, or convert PHP back to plain HTML.",
  steps: [
    "Choose the HTML to PHP or PHP to HTML card, then paste markup under \"Source code\" or press Upload code for a .html, .htm, .php, .phtml or .txt file.",
    "Switch the conversion options: Safe echoes, Strict types, Base-path assets and Add PHP block for HTML to PHP; Strip config, Echo placeholders, Logic as comments and PHP comments for the reverse.",
    "Press Download in the Generated PHP panel to save converted.php, or converted.html when running PHP to HTML.",
  ],
  intro:
    "This converter turns static HTML into a PHP template and back again: HTML to PHP rewrites every {{ placeholder }} as <?= htmlspecialchars($var, ENT_QUOTES, 'UTF-8') ?>, prepends a <?php declare(strict_types=1); ?> block declaring each variable, and makes root-relative src/href/action paths base-path aware by prefixing $basePath. PHP to HTML runs the same mapping in reverse, stripping the config block and converting echoes back to {{ }} placeholders so a designer can work in plain markup. Control-flow blocks such as <?php if ... ?> are kept as HTML comments so nothing is lost in translation.",
  useCases: [
    "You bought an HTML theme and need it turned into a PHP template with escaped output before you drop it into an existing site",
    "You are moving a PHP site from the domain root into a /shop subdirectory and want every /assets/... link rewritten to go through $basePath",
    "A front-end developer needs to restyle a page that currently exists only as a .php file full of echo statements, and wants clean HTML with visible placeholders",
  ],
  benefits: [
    ["Escaped by default, not raw echo", "Placeholders become htmlspecialchars($var, ENT_QUOTES, 'UTF-8'), which escapes single and double quotes as well as < > &, so pasted values cannot break out into markup."],
    ["Only real local paths get rewritten", "Base-path rewriting skips protocol-relative //, https:, mailto:, tel:, data:, javascript: and #anchors, so external links and inline data URIs are left alone."],
    ["Round-trips without losing logic", "include/require lines and <?php ... ?> control blocks come back as HTML comments recording the original code, and the count is surfaced as a warning."],
  ],
  faqs: [
    [
      "What escaping does the generated PHP use?",
      "htmlspecialchars($var, ENT_QUOTES, 'UTF-8') on every placeholder. ENT_QUOTES is the flag that escapes both double and single quotes — the default would leave ' untouched, which is exactly the gap that breaks single-quoted HTML attributes — and naming UTF-8 explicitly avoids relying on the server's default charset.",
    ],
    [
      "Why did my src and href attributes gain a $basePath prefix?",
      "Because they started with a single / , which breaks as soon as the app moves out of the domain root. The tool prefixes only those, declares $basePath = ''; at the top so behaviour is unchanged until you set it, and skips //, https:, mailto:, tel:, data:, javascript: and # values entirely.",
    ],
    [
      "Does it convert PHP if statements and loops into HTML?",
      "No. Only echo forms map cleanly — <?= $x ?>, <?= htmlspecialchars($x, ENT_QUOTES, 'UTF-8') ?> and their <?php echo ...; ?> equivalents become {{ x }}. Anything else, including if/foreach and include/require, is preserved as an HTML comment listing the original code so you can port it deliberately.",
    ],
    [
      "Is the generated PHP safe to put straight into production?",
      "Treat it as a starting point. The output escapes variables correctly and declares strict_types, but the variable values are placeholder strings derived from your key names, and any JavaScript, database access or logic that was in the source is left for you to review — the tool warns when it detects inline <script> or pre-existing PHP tags.",
    ],
  ],
};

export default seo;
