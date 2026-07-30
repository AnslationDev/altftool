const seo = {
  intro:
    "This screenshot tool renders any public web page at a 1024x768 desktop viewport and returns it as a downloadable PNG, JPG, or animated GIF. You paste a URL — the protocol is added for you if you leave it off — and get back a full-page capture you can download or link to. It is built for people who need a picture of a live site without installing a browser extension or opening DevTools.",
  useCases: [
    "You are writing release notes and need a clean shot of the competitor's pricing page as it looked today, with the date already in the filename.",
    "A client says their homepage 'looks broken' but it renders fine on your machine — you capture it from an outside network to see what a neutral visitor actually gets.",
    "You are building a link directory or portfolio grid and need consistent 1024x768 thumbnails of twenty different sites instead of hand-cropping browser screenshots.",
  ],
  benefits: [
    [
      "Fixed 1024x768 desktop frame",
      "Every capture uses the same viewport, so a set of screenshots lines up in a grid without cropping or rescaling.",
    ],
    [
      "Cache disabled on every request",
      "The capture is taken fresh rather than served from a stored copy, so you see the page as it is right now.",
    ],
    [
      "Dated, domain-named files",
      "Downloads arrive as screenshot-example.com-2026-07-29.png, so an archive of captures stays sortable without renaming.",
    ],
  ],
  faqs: [
    [
      "What size are the screenshots?",
      "Every capture is 1024x768 pixels — a standard desktop viewport. The page is rendered at that width, so responsive layouts show their desktop breakpoint rather than the mobile one.",
    ],
    [
      "Which formats can I download?",
      "Three: PNG, JPG, and GIF. PNG keeps text and UI edges sharp and is the right default; JPG produces a noticeably smaller file for photo-heavy pages; GIF is the animated option.",
    ],
    [
      "Do I have to type the https:// part?",
      "No. If the URL has no protocol, https:// is prepended automatically, so google.com and https://google.com both work. The address is then validated before any capture is attempted, and an invalid one is rejected with an error rather than a blank image.",
    ],
    [
      "Can it screenshot a page behind a login?",
      "No. The capture is made by an external renderer with no access to your cookies or session, so it only sees what a logged-out visitor sees. Pages behind authentication, paywalls, or IP allowlists will come back as a login screen or an error page.",
    ],
  ],
};

export default seo;
