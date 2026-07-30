const seo = {
  intro:
    "This tool renders whatever you type in one of three fantasy display typefaces — Cinzel Decorative for engraved-looking capitals, MedievalSharp for a quill-and-parchment look, and UnifrakturMaguntia for blackletter runes — with an optional glow behind the letters. You set the size anywhere from 24 to 96 pixels, watch the preview update live, and export the result as a PNG rendered at 2× for a crisp image. It is for making spell-style titles, invitations and captions, not for editing the text itself.",
  useCases: [
    "You are making invitations for a wizarding-themed birthday party and need the names set in something better than a system font",
    "You want a blackletter title card for a fantasy Dungeons & Dragons session handout",
    "You need a decorative header image for a story post where a plain text caption would look flat",
  ],
  benefits: [
    [
      "Three genuinely different letterforms",
      "Roman capitals, a rough medieval hand and true blackletter, rather than three variations of the same look.",
    ],
    [
      "Sized before you export",
      "The 24–96px slider changes the live preview, so what you download is the size you actually chose.",
    ],
    [
      "Exports at double resolution",
      "The PNG is captured at 2× scale on a dark background, so the letters stay sharp when scaled up or printed.",
    ],
  ],
  faqs: [
    [
      "Why does the styling disappear when I paste the copied text?",
      "Because the copy button copies plain characters, and typeface, size and glow are CSS applied on this page only. Anywhere you paste it will use its own font — use the PNG download if you need the look to travel with the words.",
    ],
    [
      "How big can the text be?",
      "From 24px to 96px, in steps of 4. The exported image is then captured at 2× scale, so a 96px setting lands at roughly 192 pixels of type height in the downloaded PNG.",
    ],
    [
      "Which fonts does it use?",
      "Cinzel Decorative, MedievalSharp and UnifrakturMaguntia — three open display faces with a wizarding or medieval feel. They are lookalike styles chosen for the mood; none of them is the official typeface of any film or book series.",
    ],
    [
      "Can I use the image commercially?",
      "Check the licence of the specific font before you do. The three faces here are freely available web fonts, but Harry Potter names, logos and marks are trademarked, so anything that trades on the franchise needs its own permission.",
    ],
  ],
};

export default seo;
