const seo = {
  intro:
    "The Email Signature Builder generates an email-safe HTML signature built from nested tables and inline styles — the only markup dialect Gmail, Outlook, Apple Mail and Yahoo all render the same way — and lets you copy it straight into your mail client. You fill in your name, role and contact details, pick one of 26 templates across Professional, Modern, Minimal, Creative and Corporate sets, and toggle optional blocks for social icons, a CTA button, meeting links, a banner, a QR code and a legal disclaimer. A built-in checker scores the result and flags the things that actually break signatures: base64 images, http:// image URLs, missing alt text and tables wider than 600px.",
  useCases: [
    "You just changed job titles and your old signature was pasted in from a colleague — you need a clean one with your new role, direct line and LinkedIn that will not collapse when someone replies from Outlook.",
    "Your agency wants every account manager on the same signature layout, so you set one template, accent colour and disclaimer, then hand each person the generated HTML to paste into Gmail settings.",
    "You are handing out your details at a conference and want a QR code in your signature that saves a vCard 3.0 contact card rather than just opening your website.",
  ],
  benefits: [
    [
      "Outlook preview mode",
      "Switching the preview to Outlook strips border-radius from buttons and photos so you see the square corners Word's rendering engine will actually draw.",
    ],
    [
      "Deterministic compatibility checks",
      "Every render is scored against concrete failure modes — embedded base64 images, mixed-content http:// sources, missing alt text, signature width over 600px, HTML over 40KB.",
    ],
    [
      "Self-contained social icons",
      "Social badges are drawn as coloured table cells with letter labels instead of hosted images, so they still appear when a recipient's client blocks remote images.",
    ],
  ],
  faqs: [
    [
      "Why does my signature look broken in Outlook but fine in Gmail?",
      "Outlook renders email with Microsoft Word's engine, which ignores flexbox, grid, CSS variables and media queries and drops border-radius. This builder outputs nested tables with inline styles and explicit pixel widths for that reason, and the Outlook preview toggle shows you the square-cornered version before you paste it.",
    ],
    [
      "How wide should an email signature be?",
      "Keep it at or under 600px — the builder defaults to 480px and warns once you exceed 600px, because most email bodies render at 600px or less and a wider table forces horizontal scrolling. Banners are a tighter constraint still: many mobile clients show roughly 320-420px, so anything above 500px gets scaled or cut.",
    ],
    [
      "Can I upload my photo or logo instead of linking to one?",
      "You can, but the checker flags it as a warning: uploaded images become base64 data URLs, and Outlook plus several webmail clients refuse to display them. For images that show up everywhere, host the file and paste its https:// URL — http:// sources are flagged as an error because mixed content is blocked outright.",
    ],
    [
      "What does the QR code in the signature contain?",
      "Three options: your website URL, a custom link, or a vCard 3.0 record built from the name, title, company, email, work and mobile numbers, website and address you entered. The vCard mode is what lets someone scan once and save you as a contact, and you can also download the same record as a .vcf file.",
    ],
  ],
};

export default seo;
