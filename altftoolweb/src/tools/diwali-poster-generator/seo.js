const seo = {
  intro:
    "The Diwali Poster Generator produces a festival sale or greeting poster and works out the offer numbers behind it. Enter a list price, a discount rate and an optional \"up to ₹X\" cap, and it returns the price after discount, the rupee saving and the effective discount once the cap bites — so the headline on the poster matches the bill at the counter. Five warm palettes are checked against the WCAG contrast minimums (4.5:1 for body text, 3:1 for large text) and export sizes cover a 1080 px square, a 1080 × 1920 story and A4 at 300 dpi.",
  useCases: [
    "Put out a \"flat 40% off\" poster for a Diwali week sale with the exact discounted price printed underneath.",
    "Check what a 30% off capped at ₹1,000 offer really gives on a ₹5,000 product before you print it (20%, not 30%).",
    "Print A4 posters for the shop window and post the same layout as a square and a story the same morning.",
    "Send a plain Diwali greeting poster with the shop name, address and phone number instead of an offer.",
  ],
  benefits: [
    [
      "Offer maths, not guesswork",
      "Sale price, rupee saving and the effective rate after a cap are computed, so the poster cannot claim a discount you do not give.",
    ],
    [
      "Contrast-checked palettes",
      "Every palette reports its headline and body-text contrast ratio against the WCAG 2.1 4.5:1 and 3:1 minimums.",
    ],
    [
      "Diya, rangoli, kandeel and firework motifs",
      "Decoration is drawn as vectors sized to the canvas, so it stays crisp at A4 print resolution.",
    ],
  ],
  faqs: [
    [
      "How do I calculate the price after a Diwali discount?",
      "Saving = price × discount ÷ 100, and the customer pays price − saving. A ₹2,499 item at 40% off saves ₹999.60 and sells for ₹1,499.40. Enter the two numbers and the poster prints both figures.",
    ],
    [
      "What does '30% off up to ₹1,000' actually mean?",
      "The percentage applies until the rupee saving hits the cap, then the cap takes over. On a ₹5,000 purchase 30% would be ₹1,500, so the ₹1,000 cap applies and the effective discount is 20%. The tool flags this and shows the effective rate.",
    ],
    [
      "What size should a Diwali poster be for print and for Instagram?",
      "A4 at 300 dpi is 2480 × 3508 px for print; use 1080 × 1080 px for a feed post and 1080 × 1920 px for a story or WhatsApp status. All three export from the same details here.",
    ],
    [
      "Are there rules about advertising festival discounts in India?",
      "Yes — a discount claim has to reflect what the customer is actually charged, and misleading price advertising falls under the Consumer Protection Act 2019 and the CCPA's guidelines on misleading advertisements. Print the cap, the validity dates and any exclusions; this tool is informational, so confirm pricing and GST treatment with your accountant.",
    ],
  ],
};

export default seo;
