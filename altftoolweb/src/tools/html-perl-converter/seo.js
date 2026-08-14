const seo = {
  title: "HTML to Perl CGI Converter, and Perl Back to HTML",
  metaDescription:
    "Wrap HTML in a printed heredoc with each {{ placeholder }} declared as a Perl scalar, or pull the heredoc back out and strip the CGI boilerplate.",
  steps: [
    "Choose HTML to Perl or Perl to HTML, then paste into Source code, press Upload code for a .html, .pl, .cgi or .pm file, or press Load sample.",
    "Toggle the conversion options — Add shebang, Strict + warnings, CGI header and Placeholders to scalars going out, or Strip boilerplate and VPerl expressions coming back.",
    "Read the converted output with its warnings about unescaped dollar signs, then Copy it or Download converted.cgi or converted.html.",
  ],
  intro:
    "This converter moves markup between plain HTML and Perl CGI in both directions: HTML to Perl wraps your markup in a heredoc printed after a CGI header, turning every {{ placeholder }} into a declared Perl scalar, and Perl to HTML pulls the heredoc body back out, strips the shebang and use strict/CGI boilerplate, and rewrites $scalars and <%= %> VPerl tags back into {{ placeholder }} form. It is aimed at anyone maintaining legacy CGI scripts who wants to edit the markup in a normal HTML editor instead of inside quoted Perl. Logic blocks like <% if ... %> are preserved as HTML comments rather than silently dropped, so nothing disappears without a trace.",
  useCases: [
    "You inherited a .cgi script where the page markup lives inside a print <<\"HTML\" heredoc, and you want the HTML extracted so a designer can restyle it",
    "You have a finished HTML mockup with {{customer.name}} placeholders and need it emitted as a CGI script with my $customer_name declarations already in place",
    "You are porting a VPerl-style template to a modern engine and want <%= $order_status %> rewritten as {{ order.status }} before you paste it into the new system",
  ],
  benefits: [
    ["Heredoc terminator is chosen safely", "If the word HTML already appears alone on a line in your markup, the terminator becomes HTML_BLOCK so the heredoc cannot close early."],
    ["Placeholders become real declarations", "Each distinct {{ key }} produces one my $key = '...'; line with a readable default, so the generated script runs instead of erroring on undefined scalars."],
    ["Logic is commented, not deleted", "Non-expression <% ... %> blocks come back as <!-- Perl logic removed: ... --> and are counted in the warnings, so you know exactly what still needs rewriting."],
  ],
  faqs: [
    [
      "How does the tool print HTML from Perl?",
      "It uses a double-quoted heredoc: print <<\"HTML\"; followed by your markup and a closing HTML line. Double quotes are deliberate, because that is what allows $scalar interpolation inside the block; if the terminator word already exists on its own line in your markup, the tool switches to HTML_BLOCK to avoid closing the block early.",
    ],
    [
      "Why do the dollar signs in my CSS or JavaScript trigger a warning?",
      "Because a double-quoted heredoc interpolates them. Perl will try to read $foo inside your markup as a variable, so any literal dollar sign — a jQuery $, a price, a regex — has to be escaped as \\$ or the output will be wrong. The tool raises this warning whenever it finds a $ in HTML that contained no placeholders.",
    ],
    [
      "Does it convert Perl loops and conditionals into HTML?",
      "No, and that is intentional. Expression tags <%= $name %> map cleanly to {{ name }}, but control flow such as <% foreach %> or <% if %> has no HTML equivalent, so each block is turned into an HTML comment recording the original code and counted in the warnings for you to port by hand.",
    ],
    [
      "What Perl boilerplate gets removed going back to HTML?",
      "The shebang line, use strict; and use warnings;, the use CGI qw(...) import, print header(...) and any raw print \"Content-Type: ...\" line. When a heredoc is found, its body is used directly instead — the surrounding script is simply not carried over.",
    ],
  ],
};

export default seo;
