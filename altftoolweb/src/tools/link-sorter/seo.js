const seo = {
  title: "Free Link Shortener — Shorten Any URL Instantly",
  h1: "Free Link Shortener",
  metaDescription:
    "Paste a long URL and get a short link back in seconds, with your last five kept on screen. Free, no signup, no cap on how many you shorten.",
  intro:
    "This tool shortens a long URL into a compact, shareable link. Paste a link — with or without the https:// prefix, which is added for you — press Shorten, and the short URL comes back with Copy and Visit buttons beside it, plus the last five you made listed underneath for the rest of the session. The shortening itself is done by a third-party service: the URL is sent to cleanuri.com's API, and if that call fails the tool falls back to TinyURL, so the link you get back lives on whichever of those two answered. Nothing else about the link is stored, and there is no account step.",
  useCases: [
    "Shortening a long product, article or tracking link before pasting it into a social post or a text message",
    "Turning a campaign URL trailing a long string of UTM parameters into something short enough to read out or print",
    "Shortening several links in a row during one work session, with the last five kept on screen so you can copy any of them again",
  ],
  benefits: [
    [
      "One paste, one click",
      "Type or paste the URL — bare domains like example.com work, the https:// is added for you — then press Shorten. There is no account, no email step and no limit on how many links you shorten.",
    ],
    [
      "Copy or open without leaving the page",
      "Each result has a Copy button that confirms with a tick and a Visit button that opens the short link in a new tab, so you can check it lands where you intended before you send it.",
    ],
    [
      "Your last five stay listed",
      "Recent links are kept in a list showing the original URL, the short one and the date, each with its own copy and open buttons. The list lives in the page only, so it clears when you reload or close the tab.",
    ],
    [
      "A fallback if the first service is down",
      "The URL goes to cleanuri.com first; if that request fails or errors, the tool retries through TinyURL automatically rather than just showing you an error.",
    ],
  ],
  faqs: [
    [
      "Does this tool sort links or shorten them?",
      "It shortens them. Despite the page's URL, this is a URL shortener: it takes one long link and returns one short link. It does not sort, alphabetise or reorder a list of URLs — if that is what you came for, this is not the tool.",
    ],
    [
      "How do I shorten a URL for free?",
      "Paste the long URL into the box and press Shorten. The short link appears immediately with Copy and Visit buttons, and no signup is required. Bare addresses such as example.com or www.site.com are accepted — the tool adds https:// before sending them.",
    ],
    [
      "Which service actually creates the short link?",
      "cleanuri.com, via its public shorten API. If that request fails for any reason the tool retries automatically through TinyURL, so the link you get back will be on one of those two domains. That also means the URL you paste is sent to that third-party service to be shortened; it is not processed on this page.",
    ],
    [
      "Do the shortened links expire?",
      "That is up to whichever service issued the link, not this page. Neither cleanuri.com nor TinyURL is operated by AltFTool, so if a link has to keep working for years, use a shortener you control or keep the original URL somewhere safe.",
    ],
    [
      "Can I shorten a URL that already has UTM tracking parameters?",
      "Yes. Paste the whole URL including the query string, and the short link redirects to that exact address with every parameter intact — which is the usual reason for shortening a campaign link in the first place.",
    ],
    [
      "Where did my list of recent links go?",
      "It is held in the page rather than saved, so reloading or closing the tab clears it, and Clear all empties it on demand. Only the five most recent are shown at any time. Copy anything you need to keep before you leave the page.",
    ],
    [
      "Why did I get an error instead of a short link?",
      "Either the text was not a usable URL — it needs a dot and no spaces — or both shortening services were unreachable. The message tells you which: an invalid-URL warning appears as soon as you press Shorten, whereas a connection failure is reported only after both attempts have been tried.",
    ],
  ],
  steps: [
    "Paste your long URL into the box — example.com, www.site.com and https://site.com/path are all accepted.",
    "Press Shorten and wait a moment for the short link to come back from the shortening service.",
    "Press Copy to take the link, or Visit to open it in a new tab and confirm it goes to the right page.",
  ],
};

export default seo;
