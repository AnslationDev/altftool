const seo = {
  intro:
    "The Bio Link Page Builder lays out a link-in-bio profile — photo, name, handle, tagline, a bio capped at 180 characters, and a drag-to-reorder stack of buttons — and renders it live in a phone-shaped preview. Each link is validated against http, https, mailto and tel schemes and tagged with one of eleven platform icons, and the whole project autosaves locally and exports as JSON. It is for creators planning the layout and copy of a link page before committing to a hosting service.",
  useCases: [
    "You are about to move your Instagram link to a new service and want to settle the button order and wording first, dragging the top three links into the position that gets tapped most.",
    "A client asked for two versions of their link page in different colour schemes, so you build one, export the JSON, then switch preset and accent colour for the second.",
    "You have eight links and no idea which fit on one screen, so you use the phone preview to see exactly where the fold lands before deciding what to cut.",
  ],
  benefits: [
    ["Reorder by dragging, with keyboard support too", "Links sort via drag-and-drop or arrow keys, so the running order you settle on is the order you see in the preview immediately."],
    ["Catches broken links before your audience does", "Every URL is parsed and flagged unless it resolves to http, https, mailto or tel, and a bare domain is auto-prefixed with https://."],
    ["The whole project is portable", "Profile, links and theme export as a single JSON file you can re-import or hand to a designer, rather than being locked in an account."],
  ],
  faqs: [
    [
      "How long can the bio be?",
      "180 characters. The counter above the field updates as you type and input stops at the limit, which keeps the bio short enough to read without scrolling on a phone-sized preview.",
    ],
    [
      "Does this publish my page at a real URL?",
      "No. The altftool.com/bio/ address it shows is a simulated preview URL used to demonstrate the share card and generate the QR code — nothing is uploaded or hosted. Export the JSON and use it to set the page up wherever you actually host it.",
    ],
    [
      "Will my page still be here if I close the tab?",
      "Yes. The project autosaves to your browser's local storage after every edit and reloads when you return. It is tied to that browser and profile, so clearing site data or switching devices loses it — export the JSON if you need a copy.",
    ],
    [
      "What can I customise about the look?",
      "Four gradient presets, a free-choice accent colour, corner radius from 8 to 32 pixels, three button styles (glass, solid, outline) and three typefaces. Profile images accept PNG, JPEG and WEBP.",
    ],
  ],
};

export default seo;
