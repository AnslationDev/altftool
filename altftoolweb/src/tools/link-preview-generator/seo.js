const seo = {
  title: "Link Preview Generator — Free Open Graph Preview",
  h1: "Link Preview Generator — Open Graph & Social Card Preview",
  metaDescription:
    "Paste any URL to see the title, description, and image it shows when shared. Server-side Open Graph lookup — free, no signup, no API key needed.",
  intro:
    "The Link Preview Generator resolves any http(s) URL on the server and returns the metadata a social platform reads from it: page title, description, preview image, and the resolved URL. Your browser calls AltFTool's /api/tools/link-preview endpoint, which queries the linkpreview.net metadata API using a server-held key — so you never need your own API key or an account. The result is rendered as a share-style card with the image, title, description, and a link through to the page, and the last five URLs you check are kept in your browser's localStorage.",
  useCases: [
    "Checking how a blog post or landing page will unfurl on WhatsApp, LinkedIn, Facebook, or Slack before you post the link",
    "Confirming a freshly deployed page actually publishes og:title, og:description, and og:image after a CMS, theme, or template change",
    "Seeing the title and description behind an unfamiliar or shortened link without loading the whole page yourself",
  ],
  benefits: [
    [
      "Reads the tags platforms actually read",
      "The card is built from the page's Open Graph and meta title, description, and image — the same fields Facebook, LinkedIn, WhatsApp, and Slack use to build their unfurls.",
    ],
    [
      "No API key, no account",
      "The metadata lookup runs on AltFTool's server with our key. There's nothing to sign up for, nothing to install, and no key to paste in.",
    ],
    [
      "Server-side fetch, cached for an hour",
      "Each URL is resolved server-side and the response is cached for up to 60 minutes, so repeat checks of the same link come back immediately instead of re-hitting the target site.",
    ],
    [
      "Recent lookups stay in your browser",
      "The last five URLs you check are stored in your browser's localStorage and shown as chips under the input — the list lives on your device, not in an account.",
    ],
  ],
  faqs: [
    [
      "How do I preview a link before posting it on social media?",
      "Paste the full URL (including https://) and click Generate. The tool returns the page's title, description, and preview image and renders them as a card — the same three fields Facebook, LinkedIn, WhatsApp, and Slack read when they unfurl a link. Each platform crops the image to its own aspect ratio, so use the card to check the content of your metadata rather than as a pixel-exact mockup.",
    ],
    [
      "Is this link preview generator free?",
      "Yes — free, with no signup and no API key of your own. The metadata lookup runs through AltFTool's server, so there's nothing to configure before you paste a URL.",
    ],
    [
      "Why does my link preview show no image?",
      "Because the page returned no image in its metadata, or the image URL failed to load. The card only renders an image when one comes back in the response; if that image URL is broken or blocks hotlinking, a placeholder is shown instead. The fix on your own site is a single absolute-URL og:image tag, for example content=\"https://example.com/share.jpg\" — relative paths often don't resolve for crawlers.",
    ],
    [
      "Why is the preview still showing my old title or image after I updated the page?",
      "Two separate caches are involved. AltFTool caches each URL's metadata for up to an hour, so either wait it out or check a slightly different URL (adding a harmless ?v=2 makes it a new lookup). Social platforms keep their own caches too, and those must be cleared with the platform's own tools — Facebook's Sharing Debugger, LinkedIn's Post Inspector, or X's card validator.",
    ],
    [
      "Do I have to type http:// or https:// before the URL?",
      "Yes. The endpoint only accepts URLs that begin with http:// or https:// and rejects anything else with a 400 error, which the page shows as \"Failed to fetch preview. Try a valid URL.\" So paste https://example.com/page, not example.com/page.",
    ],
    [
      "Can I generate a preview for a page behind a login or on localhost?",
      "No. The page is fetched from a server on the public internet, so URLs that need a logged-in session, sit on an internal network, or point at localhost / 127.0.0.1 can't be reached and will return an error. Deploy or publish the page to a publicly reachable URL first, then check it.",
    ],
    [
      "What metadata does the tool actually return?",
      "Four fields: title, description, image, and the resolved URL — all rendered directly on the preview card. Pages with proper Open Graph tags return the richest result; pages without them usually still return a title and description from the standard <title> and meta description, but often come back with no image.",
    ],
    [
      "Is there a limit on how many links I can check?",
      "Yes — 30 lookups per minute from the same IP address. Past that the API replies with HTTP 429 and a retry message, and the limit resets within the minute. Repeat checks of the same URL inside the one-hour cache window return instantly, but they still count toward that per-minute limit.",
    ],
  ],
  steps: [
    "Paste the full URL, including https://, into the input box.",
    "Click Generate — the server fetches the page's metadata and returns its title, description, image, and resolved URL.",
    "Review the preview card; the last five URLs you checked are saved as chips under the input box.",
  ],
};

export default seo;
