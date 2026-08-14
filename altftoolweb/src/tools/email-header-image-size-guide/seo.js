const seo = {
  title: "Email Header Image Size: Export at 2x for Retina",
  metaDescription:
    "Enter the display size, get the 2x export dimensions, the width and height attributes Outlook's Word engine needs, and how it renders on phones.",
  steps: [
    "Set 'Display width in the template (px)' - the 600 px, 640 px, 680 px and 320 px chips fill it for you - along with 'Display height (px)', an Export multiplier of 1x, 2x retina or 3x, and 'Current file size (KB)'.",
    "Add the Hosted image URL, Alt text and any Click-through URL so the generated img tag is complete.",
    "Read 'Export the header at' plus the 'Attributes to put on the img tag' and 'Gmail clipping threshold' rows, check 'How it renders on phones', then press Copy markup for the img tag or Copy result for the summary.",
  ],
  intro:
    "An email header image has two sizes: the width it occupies in the template and the larger size you actually export so it stays sharp on high-density screens. This guide takes the display size, applies the retina multiplier, and returns the export dimensions, the width and height attributes Outlook's Word rendering engine requires, the rendered size on 320, 375 and 414 px phone viewports, and the img markup ready to paste. It also flags a header taller than 60% of its width, which pushes your first line of copy out of the preview pane.",
  useCases: [
    "Exporting a 600 x 200 px header as a 1200 x 400 px file so it stays sharp on retina screens.",
    "Working out why a header looks soft in Outlook on a high-DPI Windows laptop.",
    "Checking the rendered height of a header on a 375 px iPhone before it eats the whole first screen.",
    "Getting img markup with explicit width and height attributes because Outlook ignores CSS max-width.",
  ],
  benefits: [
    [
      "Retina handled correctly",
      "Export at 2x, place at 1x with explicit attributes — the pattern that works across every major client.",
    ],
    [
      "Mobile rendering shown",
      "See the exact rendered height at three common phone widths before the send, not after.",
    ],
    [
      "Client quirks listed",
      "Outlook's Word engine, Gmail's clipping limit and dark-mode recolouring are all called out.",
    ],
  ],
  faqs: [
    [
      "What size should an email header image be?",
      "Match the template width, which is 600 px for most email templates and up to 640 px for wide ones, and keep the height under about 60% of the width so copy stays visible in the preview pane. Export at twice those numbers for retina: a 600 x 200 px header becomes a 1200 x 400 px file placed with width=\"600\" height=\"200\".",
    ],
    [
      "Why is my email header blurry in Outlook?",
      "Outlook on Windows uses the Word rendering engine and scales images by the system DPI setting, so a 1x export gets stretched and softened on a high-DPI display. Export at 2x and constrain it with the width and height attributes on the img tag; Outlook ignores CSS max-width, so those attributes are what actually control the size.",
    ],
    [
      "How large can an email be before Gmail clips it?",
      "Gmail truncates a message and shows a \"View entire message\" link once the HTML passes about 102 KB. Linked images do not count towards that, but base64-embedded images do, which is one reason to host header images rather than inline them. Keep the header file itself under about 200 KB so it loads quickly on mobile data.",
    ],
    [
      "Should an email header be one big image?",
      "Prefer live text over an all-image header. Many recipients block images by default, so an image-only header shows nothing but alt text, and image-heavy emails are more likely to be filtered. Use an image for the visual and real HTML text for the headline and call to action.",
    ],
  ],
};

export default seo;
