// Single source for the /altfloveimg FAQ. components/home/FAQ.jsx renders this
// array and page.jsx feeds the same array to createFaqJsonLd, so the visible
// copy and the FAQPage markup cannot drift apart.
//
// FAQ.jsx renders every answer unconditionally — the accordion collapses its
// panel with `grid-template-rows: 0fr`, it does not unmount the text — so this
// copy is in the server HTML, which is what makes the schema legal.
//
// Shaped as { question, answer } to match createFaqJsonLd directly rather than
// forcing every consumer to remember a { q, a } mapping.
export const FAQS = [
  {
    question: "Are my images uploaded anywhere?",
    answer:
      "No. Every tool runs entirely inside your browser using the Canvas, File and Blob APIs. Your images never leave your device, which makes the platform private by design and able to work even offline.",
  },
  {
    question: "Is it really free and unlimited?",
    answer:
      "Yes. There are no file-size caps, daily limits, accounts or hidden fees. Because the processing happens on your own device, we can offer it free and unlimited.",
  },
  {
    question: "Which formats are supported?",
    answer:
      "You can work with JPG, PNG, WEBP, GIF and BMP inputs, and export to JPG, PNG and WEBP. Dedicated converters make switching between formats one click.",
  },
  {
    question: "Will the tools add a watermark to my images?",
    answer:
      "Never. The only watermark you'll ever see is one you add yourself with the Watermark tool. Exports are always clean.",
  },
  {
    question: "Can I process multiple images at once?",
    answer:
      "Yes. Tools like Compress and the converters support batch processing — drop in many images, process them together, and download everything as a single ZIP file.",
  },
  {
    question: "Do the AI tools work right now?",
    answer:
      "The Background Remover runs a real on-device model and the Upscaler enhances images in your browser. The architecture is prepared to plug in even more advanced AI models in the future.",
  },
];
