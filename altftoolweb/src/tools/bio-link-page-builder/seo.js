const seo = {
  title: "Link-in-Bio Page Builder with Live Phone Preview",
  metaDescription:
    "Lay out a link-in-bio profile with drag-to-reorder buttons, a QR share card and a 180-character bio; autosaves locally and exports as JSON.",
  intro:
    "The Bio Link Page Builder lays out a link-in-bio profile — photo, name, handle, tagline, contact line and a bio capped at 180 characters — and renders that profile card live in a phone-shaped preview, together with a share card and QR code. The buttons themselves are built in a separate drag-to-reorder list, each link validated against http, https, mailto and tel schemes and tagged with one of eleven platform icons, and the whole project autosaves locally and exports as JSON. It is for creators planning the layout and copy of a link page before committing to a hosting service.",
  useCases: [
    "You are about to move your Instagram link to a new service and want to settle the button order and wording first, dragging the top three links into the position that gets tapped most.",
    "A client asked for two versions of their link page in different colour schemes, so you build one, export the JSON, then switch preset and accent colour for the second.",
    "You have eight links and no idea which of them are actually usable, so you work down the publish-ready counter on the Links panel until every card says Ready for preview instead of showing an error.",
  ],
  benefits: [
    ["Reorder by dragging, with keyboard support too", "Links sort by dragging the grip handle or by moving it with the keyboard, and the running order you settle on is the order saved locally and written into the export."],
    ["Catches broken links before your audience does", "Every URL is parsed and flagged unless it resolves to http, https, mailto or tel, and a bare domain is auto-prefixed with https://."],
    ["One file holds the whole project", "Profile, links and theme download together as <username>-bio-link-page.json, readable enough to hand to a designer or keep as a backup; the builder writes that file but has no import, so the browser copy stays your working version."],
  ],
  faqs: [
    [
      "How long can the bio be?",
      "180 characters. The Profile Setup header counts the characters used as you type and input stops at the limit, which keeps the bio short enough to read without scrolling on a phone-sized preview.",
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
      "Four gradient presets, a free-choice accent colour, three typefaces, three button styles (glass, solid, outline) and a corner radius from 8 to 32 pixels. The preview applies the preset gradient, the typeface and the accent colour on your tagline; button style and radius are stored with the project and travel in the export, since the preview shows the profile and share card rather than the link buttons. Profile images accept PNG, JPEG and WEBP.",
    ],
  ],
};

export default seo;
