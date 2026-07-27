const seo = {
  intro:
    "X Twitter Header Maker plans a 1500 × 500 profile header — X's recommended 3:1 canvas — with the circular profile photo mapped as an exclusion zone on the bottom left and the mobile app's translucent top bar mapped across the top. It measures the two candidate text areas, returns the larger one in exact pixel coordinates, checks your headline size against the roughly 600 pixel column the header renders in, and exports an SVG guide layer. Canvas sizes are X's own; the overlay geometry is adjustable because X does not publish it.",
  useCases: [
    "Place a tagline so the avatar never lands on top of it.",
    "Retrofit an old 1200 × 400 banner to the current 3:1 canvas without cropping the logo.",
    "Check whether 40 px type in the artwork survives the drop to a 600 px rendered column.",
    "Hand a designer an SVG overlay that shows the avatar and top bar exactly where they fall.",
  ],
  benefits: [
    ["Both overlays modelled", "Accounts for the avatar circle and the mobile top bar, not just the canvas size."],
    ["Exact coordinates", "The safe rectangle comes back with x, y, width and height so you can type it into your design tool."],
    ["Legibility check", "Converts artwork type size into the pixel size a reader actually sees in the profile column."],
  ],
  faqs: [
    [
      "What size is an X header image?",
      "1500 × 500 pixels, a 3:1 ratio. Uploading an exact multiple such as 3000 × 1000 keeps the same crop and looks sharper on high-density screens. The profile photo is a separate 400 × 400 image displayed as a circle.",
    ],
    [
      "Why does X cut off part of my header?",
      "Three things trim it: X crops anything that is not 3:1, the circular profile photo sits over the lower left, and on mobile a translucent bar with your name is drawn across the top when the profile scrolls. Keep type clear of all three.",
    ],
    [
      "What file format should I use for an X header?",
      "JPG for photographs and PNG for flat graphics with text; GIFs are accepted but only a static frame is shown on the header. Keep the file comfortably small — a few megabytes at most — so it loads before the profile does.",
    ],
    [
      "How large should text be on an X header?",
      "The header is usually rendered around 600 pixels wide on desktop, so artwork is displayed at roughly 40% of its design size. Type set at 72 px in the file arrives at about 29 px on screen; anything that lands under about 12 px is not readable.",
    ],
  ],
};

export default seo;
