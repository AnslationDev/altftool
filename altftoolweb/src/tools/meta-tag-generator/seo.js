const seo = {
  title: "Meta Tag Generator — Free SEO & Open Graph Tags",
  h1: "Meta Tag Generator",
  metaDescription:
    "Generate SEO, Open Graph and Twitter meta tags from one form, with live Google and social previews and a 0-100 readiness score. Runs in your browser.",
  intro:
    "The Meta Tag Generator builds a complete document head — charset, viewport, title, description, keywords, author, robots, canonical, favicon, theme-color, the full Open Graph set and Twitter card tags — from a single form, rebuilding the block on every keystroke. Each value is HTML-escaped (&, \", < and >) before it is written into an attribute, so an ampersand in a description or quotes in a title can't break the markup. Alongside the output it scores SEO readiness out of 100 from six checks (title 45–60 characters, description 120–160, an HTTPS canonical, an absolute image URL, at least two keywords, and a site name) and renders both a Google result snippet and a 1.91:1 social card from the same fields. It is client-side React with no server call — nothing you type is uploaded.",
  useCases: [
    "Writing the head block for a new landing page and needing the SEO, Open Graph and Twitter values to match each other exactly",
    "Checking a title and meta description against the 45–60 and 120–160 character windows before search results truncate them",
    "Fixing a link that posts to social as a bare URL by generating correct og:image, og:url and twitter:card markup",
  ],
  benefits: [
    [
      "One form, up to 22 tags",
      "Enter the title, description, canonical URL and image once and the same values are written into the standard SEO tags, the Open Graph block and the Twitter card tags, so the three can't drift apart.",
    ],
    [
      "Length and quality checks as you type",
      "Live character counters plus pass/warn states for the 45–60 character title and 120–160 character description, a non-HTTPS canonical, and a social image that isn't an absolute URL.",
    ],
    [
      "Google and social previews side by side",
      "A search snippet (domain, blue two-line title, three-line description) and a 1.91:1 social card render from your current values, so you see the truncation before you ship.",
    ],
    [
      "Copy or download, nothing leaves the browser",
      "Copy the whole block to the clipboard or save it as meta-tags.html. Generation is client-side React — no upload, no account, no limit on how many pages you do.",
    ],
  ],
  faqs: [
    [
      "What is a meta tag generator?",
      "It's a tool that turns page details you type — title, description, URL, image, site name — into the HTML meta tags that go in your document head. This one outputs up to 22 tags in a single block: charset and viewport, the title element, description, keywords, author, robots and canonical, favicon and theme-color, seven Open Graph tags, and five Twitter card tags.",
    ],
    [
      "How long should a title tag and meta description be?",
      "This generator treats 45–60 characters as the good range for a title and 120–160 for a description, and flags anything shorter in amber or longer in red. Live counters next to each field show the current length as you type, and the Google preview clamps the title to two lines and the description to three so you can see where truncation lands.",
    ],
    [
      "Which meta tags does the generator output?",
      "Charset, viewport, title, description, keywords, author, robots, theme-color, a favicon link and a canonical link; og:type, og:title, og:description, og:url, og:image, og:site_name and og:locale; and twitter:card, twitter:site, twitter:title, twitter:description and twitter:image. Optional fields are dropped from the output when left blank, so clearing keywords or the author removes those lines entirely.",
    ],
    [
      "Is this meta tag generator free?",
      "Yes — free, with no signup and no cap on how many tag sets you generate. There is no account layer on the tool at all; the whole thing runs as client-side code in your browser.",
    ],
    [
      "Where do I paste the generated meta tags?",
      "Inside the head element of your HTML page, before the closing head tag. Use the Download button to save the block as meta-tags.html, or Copy to put it straight on your clipboard. If your page already has a charset, viewport or title line, replace those rather than duplicating them.",
    ],
    [
      "How is the SEO readiness score calculated?",
      "Six checks worth 16 points each, on top of a 4-point base, capped at 100. The checks are: title within 45–60 characters, description within 120–160, a canonical URL starting with https://, an image URL that is absolute (http or https), at least two comma-separated keywords, and a non-empty site name.",
    ],
    [
      "Do I still need Open Graph tags if I already have a meta description?",
      "Yes. Search engines read the description tag, but Facebook, LinkedIn, Slack, WhatsApp and most chat apps read og:title, og:description and og:image, and X reads the twitter: tags. Without them a shared link usually renders as plain text with no card image. This generator fills all three sets from the same fields so you don't have to write them three times.",
    ],
    [
      "Does the tool scan my existing page for its meta tags?",
      "No — it generates tags from what you enter, it doesn't fetch or crawl a URL. The only network request the page makes is your browser loading the social image URL you provide, so the preview card can display it.",
    ],
  ],
  steps: [
    "Enter your page title, description, canonical URL and social image URL — the tag block rebuilds on every keystroke.",
    "Choose your robots directive, Open Graph type and Twitter card, then check the readiness score, the length warnings and the Google and social previews.",
    "Copy the generated block or download meta-tags.html, and paste it inside your page's head.",
  ],
};

export default seo;
