const seo = {
  title: "Text to Handwriting Converter: 40 Fonts, PNG",
  metaDescription:
    "Renders typed or imported text as a handwritten A4-style page in one of 40 fonts on ruled, grid, blank or parchment paper — download as PNG or PDF.",
  steps: [
    "Type or paste your text, or click 'Import TXT/PDF' to load a .txt file or extract the text from a simple PDF.",
    "Choose one of the 40 handwriting fonts, an ink colour and a paper style, then click 'Generate Handwritten Sheet'.",
    "Save the 800 × 1130 px page with 'Download Image (PNG)' — named handwritten-note-<timestamp>.png — or 'Download PDF Document' for a one-page PDF.",
  ],
  intro:
    "This renders typed text as a handwritten page on an 800 x 1130 pixel canvas sized to A4 proportions, drawing it character by character in one of 40 handwriting fonts over a choice of ruled, grid, blank or parchment paper. A jitter option adds per-letter variation — a slight scale change, a small rotation and a sine-wave baseline drift — so the result wobbles the way real handwriting does instead of sitting on a perfectly straight line. The finished page downloads as a PNG or as a single-page PDF.",
  useCases: [
    "You need a handwritten-looking note or letter for a card, a prop or a scrapbook page and your own writing will not photograph well",
    "You are building a mock-up — a journal spread, a classroom worksheet, a story asset — and want filled pages in the right pen colour and paper ruling",
    "You have a plain-text file of notes and want it laid out on lined paper with a red margin rule for a printable study sheet",
  ],
  benefits: [
    ["Per-letter variation, not one flat font", "With jitter on, every character gets its own scale, rotation and vertical offset plus a wave-shaped baseline drift, so repeated letters do not look identical."],
    ["Paper and ink chosen together", "Four paper styles — lined notebook with a red margin, blueprint grid, blank white and aged parchment — pair with five ink colours from royal blue ballpoint to teacher red."],
    ["Two export formats from one render", "The same canvas saves as a PNG image or as a PDF sized to the page, so you can drop it into a design or print it directly."],
  ],
  faqs: [
    [
      "How many handwriting styles can I choose from?",
      "40, ranging from casual print faces like Caveat and Indie Flower through marker styles like Permanent Marker to formal scripts such as Great Vibes and Allura. Font size is adjustable from 14px to 40px, line spacing from 20px to 60px, and letter spacing from -2px to 8px.",
    ],
    [
      "What does the jitter setting change?",
      "It varies each letter individually rather than the line as a whole: character size shifts by up to about four percent, each glyph rotates by a fraction of a degree, and the baseline drifts on a slow sine wave with a small random offset on top. Turn it off and the text renders as clean, evenly-set type on the page.",
    ],
    [
      "Can I import an existing document?",
      "Yes — plain .txt files load directly, and .pdf files are scanned for their text streams in the browser. PDF extraction is best-effort and works on simple text documents; scanned or image-only PDFs return nothing, and there is no OCR, so for those you will need to paste the text in yourself.",
    ],
    [
      "How much text fits on one page?",
      "One canvas holds whatever fits between the top margin and the bottom of the 1130-pixel page at your chosen line spacing — roughly 30 lines at the default 32px spacing. Text beyond that is not carried onto a second page, so split long documents and render them a page at a time.",
    ],
  ],
};

export default seo;
