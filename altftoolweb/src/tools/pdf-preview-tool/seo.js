const seo = {
  intro:
    "PDF Previewer renders every page of a PDF as a contact sheet of thumbnails in the browser and re-renders any page you click at 2x scale in a full-size viewer. It uses the PDF.js rendering engine on a canvas, so you can read a document without installing Acrobat or handing the file to an online viewer. Nothing is saved or converted — it is a look-only inspector.",
  useCases: [
    "An email attachment arrives on a locked-down work laptop with no PDF reader installed, and you need to check what is in it before forwarding.",
    "You have a 60-page scan and need to find which page the signed appendix landed on, without paging through one screen at a time.",
    "Before printing a design proof you want to eyeball every page at a glance to catch a blank page or an upside-down scan.",
  ],
  benefits: [
    ["Whole document at a glance", "All pages render as thumbnails in one scrolling grid, so finding the page you want is a scan, not a page-by-page hunt."],
    ["Two render passes, not one", "Thumbnails render small for speed and any page you open re-renders at 2x scale, so detail is there when you need it and not before."],
    ["True page proportions", "Thumbnails are laid out at the ISO A-series 1:1.414 aspect ratio, so pages look like pages rather than stretched boxes."],
  ],
  faqs: [
    [
      "Do I need Adobe Acrobat to open a PDF?",
      "No. This viewer renders pages with the PDF.js engine directly on an HTML canvas in your browser, so any modern browser can display the document with no reader installed.",
    ],
    [
      "Can I edit or download the PDF from the previewer?",
      "No. It is a read-only inspector: it renders pages for viewing and does not modify, convert or re-save your file. Use a merge, split or reorder tool if you need to change the document.",
    ],
    [
      "Why do the thumbnails look soft?",
      "Thumbnails are rendered at 25% scale so a long document loads quickly. Click any thumbnail and the page is re-rendered at 2x scale for a sharp full-size view.",
    ],
    [
      "Is my document uploaded to a server?",
      "No. The file is read as an array buffer in the page and every page is rasterised locally on a canvas. The PDF never leaves your device.",
    ],
  ],
};

export default seo;
