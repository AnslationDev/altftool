const seo = {
  intro:
    "The Unicode Symbol Generator is a click-to-copy library of more than 500 Unicode characters sorted into nine categories — arrows, stars, hearts, mathematical operators, currency, music, box drawing, Greek letters and miscellaneous signs. Hovering any tile shows its official code point in U+XXXX form, and clicking copies the character itself to your clipboard, not an HTML entity or an escape sequence. Recently copied symbols are kept in a strip of the last 20 so the ones you actually use stay one click away.",
  useCases: [
    "You are writing a spec and need ≤, ≥, ≠ and ∑ inline in a document whose editor has no equation tool and no symbol palette worth opening.",
    "You want an arrow or a bullet in a social profile, a spreadsheet header or a plain-text README where markup is not available and the character has to be literal.",
    "You are drawing a table or a tree in a terminal README and need the box-drawing pieces — corners, tees and crossings — that line up in a monospace font.",
  ],
  benefits: [
    [
      "Code point on hover",
      "Each tile reveals its U+XXXX value, so you can cite the exact character in a bug report or look it up in a font's coverage table.",
    ],
    [
      "Deep box-drawing and Greek sets",
      "76 box-drawing pieces and the full 49-character Greek upper and lower case set, rather than the handful most symbol pickers include.",
    ],
    [
      "Recents and favourites",
      "Starred symbols and the last 20 you copied stay pinned above the grid, which matters when you are inserting the same three characters repeatedly.",
    ],
  ],
  faqs: [
    [
      "How do I find a specific symbol?",
      "Pick the category tab — each shows its symbol count, from 27 hearts up to 169 miscellaneous signs — or use the search box, which matches across all categories by hex code point or by the symbol character itself if you paste one in. Hovering a tile confirms the code point before you copy.",
    ],
    [
      "What actually gets copied when I click a symbol?",
      "The literal character, so pasting into a document, a form field or a filename gives you the symbol itself rather than &#8594; or \\u2192. That means it works anywhere text works, including places that strip HTML.",
    ],
    [
      "Why does a symbol show as a box or a question mark after I paste it?",
      "That means the font in the destination has no glyph for that code point — the character is correct, the font just cannot draw it. Box-drawing, musical and some currency signs are the usual casualties; switching to a broader font such as a system UI or a DejaVu-style family normally fixes it.",
    ],
    [
      "Are these the same as emoji?",
      "Mostly not. Most entries here are plain text symbols that inherit the surrounding text colour, though a few in the miscellaneous set have emoji presentations and may render in colour depending on the platform. If you need a guaranteed monochrome glyph, prefer the arrows, math, Greek and box-drawing categories.",
    ],
  ],
};

export default seo;
