const seo = {
  title: "Fake Chat Maker: WhatsApp, iMessage & Discord Mockups",
  metaDescription:
    "Build labelled mock chat screenshots in six interfaces — WhatsApp, Instagram, Telegram, iMessage, KakaoTalk, Discord — and export SVG, 2x PNG or JSON.",
  steps: [
    "Pick one of the six interface templates — WhatsApp, Instagram, Telegram, iMessage, KakaoTalk or Discord — from the 'Create New' grid.",
    "Fill in Person, Time, Status and 'Message text' and press 'Add Bubble', then set the phone clock, 'Battery %', 'Read ticks', 'Watermark' and 'Dark mode'.",
    "'Export PNG' saves fake-chat-mockup.png at 2x the 430 px SVG; 'Export SVG' and the JSON button save fake-chat-mockup.svg and fake-chat-maker.json.",
  ],
  intro:
    "The Fake Chat Maker builds mock messaging screenshots for storyboards, UI demos, scripts and social posts, in six interface styles — WhatsApp, Instagram, Telegram, iMessage, KakaoTalk and Discord. You write both sides of the conversation, set the names, avatars, timestamps, phone clock, battery level, read ticks and light or dark mode, and it renders a 430-pixel-wide phone frame you can export as SVG, as a PNG at 2x scale, or as a JSON backup file of the conversation content and settings for your own reference or scripting. It is a mockup builder, not an evidence generator: the labelling toggle is on by default and the tool warns you when you switch it off before a public export.",
  useCases: [
    "You are storyboarding an app onboarding flow and need a believable conversation in the frame instead of lorem ipsum before the design review.",
    "You are writing a short film or comic where a text exchange drives the scene, and you want it rendered in a recognisable interface rather than described in stage directions.",
    "You are documenting a support workflow and need illustrative screenshots that do not expose any real customer's messages.",
  ],
  benefits: [
    ["Six interfaces, properly styled", "Each template carries its own bubble colours, corner radius, header and read-receipt colour — Instagram's 18 px bubbles and blue ticks do not look like WhatsApp's 7.5 px green ones."],
    ["Vector first", "The frame is built as SVG, so the PNG is rasterised from it at double size and stays sharp on a retina screen or a projected slide."],
    ["Portable backup", "Export the whole conversation and settings as a JSON data file, or copy it as a plain-text script, so you have a record of the mockup outside the browser for reference or scripting — the live editor itself autosaves to local storage as you go."],
  ],
  faqs: [
    [
      "Which chat apps can it imitate?",
      "Six: WhatsApp, Instagram DMs, Telegram, iMessage, KakaoTalk and Discord. Each is a styled recreation of the layout — colours, bubble shape, header and status bar — not the real app.",
    ],
    [
      "What resolution is the exported image?",
      "The SVG is always 430 px wide. The height is not fixed — it grows with your conversation (message count, captions, images) with a minimum of 700 px, so a longer chat produces a taller image. The PNG is rasterised from that SVG at 2x scale, so it is always exactly double the SVG's width and height in pixels. Because the PNG comes from vector source you can also export the SVG and scale it to any size without softening.",
    ],
    [
      "Is it legal to make a fake chat screenshot?",
      "Making a mockup for fiction, design or teaching is fine; passing one off as a real message from a real person is not. Presenting fabricated messages as genuine can amount to defamation, fraud or harassment depending on where you are and what you do with it, and courts treat forged evidence very seriously — keep the labelling on and say plainly that it is a mockup.",
    ],
    [
      "Will my conversation be saved if I close the tab?",
      "Yes, automatically — the tool autosaves your settings and messages to your browser's local storage about a second after any change, including the sample conversation on your first visit. The Save button writes the same snapshot immediately and stamps the time it did. Nothing is sent to a server, and clearing site data removes it.",
    ],
  ],
};

export default seo;
