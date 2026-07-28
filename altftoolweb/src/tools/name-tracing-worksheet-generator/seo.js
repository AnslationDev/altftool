const seo = {
  intro:
    "The Name Tracing Worksheet Generator turns a child's name into a printable practice sheet with four-line guides, a solid model to copy and dotted repetitions to trace. Letters are sized by x-height in millimetres rather than by point size, using the standard 0.52 em x-height ratio, so a 12 mm setting produces letters that really measure 12 mm from baseline to waist line on paper. It works out how many repetitions fit across the writing width and how many rows fit down the page, so nothing runs off the sheet.",
  useCases: [
    "Giving a preschooler daily practice writing their own name before they start formal handwriting lessons.",
    "Making a large-letter sheet at a 15–20 mm x-height for a three-year-old who cannot yet control small letters.",
    "Producing an uppercase version first, then switching to Title Case once the child recognises their initial.",
    "Printing a sheet that matches the band height of an existing school four-line notebook.",
  ],
  benefits: [
    ["Sized in millimetres", "Set the x-height you actually want on paper instead of guessing at a point size."],
    ["Model then trace", "The first tracing on each row is solid so the child sees the shape before copying it."],
    ["Fits the page every time", "Repetitions per row and rows per page are calculated, and long names are flagged with the largest size that fits."],
  ],
  faqs: [
    [
      "How big should letters be on a name tracing sheet?",
      "For a three or four year old, an x-height of about 15–20 mm suits developing fine motor control; by five or six, 10–12 mm is comfortable, and school four-line copies are often around 8–10 mm. Start larger and reduce as control improves.",
    ],
    [
      "Should a preschooler trace their name in capitals or Title Case?",
      "Most early-years programmes start with the capital initial and lower-case rest — Aarav rather than AARAV — because it is the form the child will write for the rest of their life. All-capitals is sometimes used first because the shapes are simpler, but it is worth moving on early.",
    ],
    [
      "Why do the printed letters look different on another computer?",
      "The sheet uses whichever child-friendly font is installed on the device, so letterforms vary between machines. Check the preview before printing a class set, particularly for the letters a and g, which are drawn differently in single-storey and double-storey fonts.",
    ],
    [
      "How do I make sure the letters print at the right size?",
      "Set the printer scale to 100% and turn off “fit to page”, then measure a lower-case letter with a ruler from the baseline to the top of the x. If it is short, the print dialog is still shrinking the page.",
    ],
  ],
};

export default seo;
