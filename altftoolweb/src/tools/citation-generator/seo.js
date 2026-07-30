const seo = {
  intro:
    "The Citation Generator turns the details of a source — authors, title, year, publisher, journal, volume, pages, DOI or URL — into a formatted reference in APA 7, MLA 9, Chicago, Harvard, IEEE or Vancouver, across nine source types from books and journal articles to websites, theses, podcasts and YouTube videos. It handles the part students most often get wrong: inverting and abbreviating author names the way each style demands, so APA gives Smith, J. A. while IEEE gives J. A. Smith. Your last 50 citations are kept in the browser so you can rebuild a reference list without retyping.",
  useCases: [
    "You have finished an essay at 1am and need the same eight sources rewritten from APA into MLA because the module handbook asks for MLA — switching styles reformats the author names and punctuation rather than just moving the year.",
    "You are citing a journal article and are unsure where the volume, issue and page range go; entering them in fields produces the correct 12(3), 45–67 shape for APA and the vol. 12, no. 3, pp. 45-67 shape for IEEE.",
    "You are referencing a website or a YouTube video for coursework and need the accessed date and URL placed where MLA 9 and IEEE actually expect them.",
  ],
  benefits: [
    [
      "Author names per style, not one generic order",
      "APA renders initials after an inverted surname and joins with '&', MLA inverts only the first author, and IEEE puts initials first — the formatter applies each rule separately.",
    ],
    [
      "Nine source types, not just books",
      "Book, website, journal article, newspaper, magazine, YouTube video, podcast, thesis and research paper each have their own field set and output shape.",
    ],
    [
      "A working reference list",
      "The last 50 citations stay in your browser's local storage and can be exported as .txt or a Word-openable .doc, so a bibliography builds up as you research.",
    ],
  ],
  faqs: [
    [
      "Which citation styles does it support?",
      "Six: APA 7, MLA 9, Chicago, Harvard, IEEE and Vancouver. APA 7, MLA 9 and IEEE have the most detailed per-source-type templates, including distinct handling for journal articles, websites and audio-visual sources.",
    ],
    [
      "What is the difference between APA and MLA author formatting?",
      "APA 7 abbreviates given names to initials and joins authors with an ampersand — Smith, J. A., & Patel, R. MLA 9 spells the first author's given name out in full and inverts only that first name, joining the rest with 'and' — Smith, Jane, and Rahul Patel.",
    ],
    [
      "Are my citations saved if I close the tab?",
      "Yes. Up to 50 recent citations are stored in your browser's local storage on this device, so they survive a reload but are not synced to an account or another machine. Clearing site data removes them.",
    ],
    [
      "Can I trust the output without checking it?",
      "Check it against your institution's style guide before submitting. The templates follow the standard patterns for each style, but style manuals contain edge cases — corporate authors, missing dates, chapters within edited volumes — and your department may impose its own variations.",
    ],
  ],
};

export default seo;
