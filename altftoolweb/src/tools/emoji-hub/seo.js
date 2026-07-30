const seo = {
  title: "Emoji Hub — 1,898 Emojis, Search & Skin Tones",
  h1: "Emoji Hub — Emoji Picker & GIF Browser",
  metaDescription:
    "Free emoji picker with 1,898 emojis in 8 categories, instant keyword search and skin tones, plus a live feed of the 20 GIFs trending on Giphy.",
  intro:
    "Emoji Hub is a two-tab browser for emojis and GIFs. The Emojis tab runs the open-source emoji-picker-react component over a bundled Unicode dataset of 1,898 emojis in 8 categories, with search powered by an in-browser character index built from every keyword attached to each emoji — so typing \"grin\", \"smile\" or \"face\" all surface the grinning face without a network request. Each glyph is drawn as a 64px Apple-style PNG from the emoji-datasource-apple package on the jsDelivr CDN, so the artwork looks identical on Windows, macOS, Android and Linux. The GIFs tab calls AltFTool's own /api/tools/giphy route, which queries Giphy's trending endpoint server-side and returns 20 GIFs, keeping the Giphy API key off the client.",
  useCases: [
    "Finding the right emoji by keyword when you can't remember what it's actually called",
    "Picking emoji artwork that looks the same for everyone, instead of whatever set the reader's operating system ships",
    "Seeing what's trending on Giphy right now without opening a separate site",
  ],
  benefits: [
    [
      "Same artwork on every device",
      "Emojis render as 64px Apple-style PNGs served from jsDelivr rather than your system emoji font, so a flag or a smiley looks the same whether you're on Windows, Android, macOS or Linux.",
    ],
    [
      "Keyword search, not just scrolling",
      "The search bar is focused the moment the tab loads and matches against every keyword in an emoji's name list — an index built in your browser, so results filter as you type with zero latency.",
    ],
    [
      "Skin tones on 323 emojis",
      "A skin-tone control sits in the search bar with five Fitzpatrick modifiers plus the default yellow; 323 of the 1,898 emojis support them, covering hands, faces and people.",
    ],
    [
      "Free, no account, nothing collected",
      "No signup and no usage limit. Emoji search and category browsing happen entirely in your browser; your picks are saved only to your own browser's localStorage.",
    ],
  ],
  faqs: [
    [
      "How many emojis are in Emoji Hub?",
      "1,898, split across 8 categories: Smileys & People (553), Animals & Nature (153), Food & Drink (135), Travel & Places (218), Activities (85), Objects (262), Symbols (223) and Flags (269). On top of that, 323 emojis carry skin-tone variants, adding 1,875 further variations.",
    ],
    [
      "How do I search for an emoji by name?",
      "Type a keyword into the search bar at the top of the picker — it's auto-focused when the Emojis tab opens. Search runs against every keyword stored with each emoji, not just its official Unicode name, so \"party\", \"cat\" or \"thumbs\" all work. Matching uses an alphanumeric index built in your browser, so nothing is sent to a server as you type.",
    ],
    [
      "What happens when I click an emoji?",
      "It's selected and pushed into the Frequently Used row at the top of the picker. That row holds up to 14 emojis ranked by how often you've picked each one, and it's stored in your browser's localStorage under the key epr_suggested — so it's still there the next time you visit, on that browser only.",
    ],
    [
      "Why do the emojis look like iPhone emojis on Windows or Android?",
      "Because the picker doesn't use your system emoji font. Every emoji is rendered as a 64px PNG from the emoji-datasource-apple package on the jsDelivr CDN, which is why the artwork is consistent for every visitor regardless of operating system.",
    ],
    [
      "Where do the GIFs come from?",
      "Giphy. The GIFs tab calls AltFTool's /api/tools/giphy route, which hits Giphy's trending endpoint on the server with a limit of 20 GIFs and returns them as a grid. The Giphy API key never reaches the browser, responses are cached for 5 minutes, and the route is rate-limited to 120 requests per minute.",
    ],
    [
      "Why are the same GIFs showing every time I open the tab?",
      "The GIFs tab shows Giphy's live trending feed, and the server caches that response for five minutes — so reopening the tab inside that window returns the same 20 GIFs. Giphy's trending list rotates through the day, so come back later and the set changes.",
    ],
    [
      "Does Emoji Hub have skin tone options?",
      "Yes. A skin-tone selector sits inside the search bar with the five Unicode skin-tone modifiers — light, medium-light, medium, medium-dark and dark — plus the neutral yellow default. 323 of the 1,898 emojis support them; the rest, like flags and most objects, have no skin-tone form in Unicode.",
    ],
    [
      "Is Emoji Hub free, and does it need an account?",
      "Yes, it's free with no signup and no usage cap. The emoji dataset ships with the page and search runs locally; the only outbound requests are the emoji image files from the jsDelivr CDN and, if you open the GIFs tab, the trending GIF request that goes through AltFTool's server to Giphy.",
    ],
  ],
  steps: [
    "Open the Emojis tab and type a keyword — \"party\", \"cat\", \"thumbs\" — into the auto-focused search bar, or scroll the 8 category tabs.",
    "Set a skin tone from the control in the search bar if the emoji supports one, then click the emoji to select it and add it to your Frequently Used row.",
    "Switch to the GIFs tab to browse the 20 GIFs currently trending on Giphy.",
  ],
};

export default seo;
