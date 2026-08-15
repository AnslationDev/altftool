const seo = {
  title: "Image to PDF Converter: One Page per Image, In Browser",
  metaDescription:
    "Merge JPG, PNG, WebP and GIF images into one PDF in your browser — each image becomes a page at its own pixel size, saved as images_merged.pdf.",
  steps: [
    "Click or drag images into the dropzone — JPG, JPEG, PNG, WEBP, GIF and other browser-readable image formats are accepted.",
    "Review the Selected Files list and remove any with the trash button; pages appear in the order the files were added.",
    "Click Download PDF Document to build the PDF with pdf-lib and save it as images_merged.pdf, one image per page at its own pixel size.",
  ],
  intro:
    "Image to PDF Converter merges JPG, PNG, WebP and other browser-readable images into a single PDF, giving each image its own page sized exactly to that image's pixel dimensions so nothing is scaled or cropped. Each file is re-encoded to JPEG at quality 0.95 over a white background before being embedded, which flattens transparency instead of leaving black boxes. The whole document is assembled with pdf-lib inside the page, so scans and receipts never leave your device.",
  useCases: [
    "You photographed six pages of a signed contract on your phone and the other side will only accept one PDF, not six JPGs.",
    "An expense claim needs receipts attached as a single document, and you want each receipt on its own page in the order you took them.",
    "A portfolio submission asks for a PDF but your work is exported as PNGs, and you need them combined without re-cropping to a fixed page size.",
  ],
  benefits: [
    [
      "Page matches the image, not A4",
      "Each page is created at the image's own width and height, so there are no white margins and no forced downscaling to a letter or A4 frame.",
    ],
    [
      "Transparency handled before embedding",
      "PNGs and WebPs are drawn over a white fill and converted to JPEG at 0.95 quality, so transparent areas come out white rather than black.",
    ],
    [
      "One document from many files",
      "Add images in batches, remove any you do not want, and the whole set is written out as a single merged PDF.",
    ],
  ],
  faqs: [
    [
      "What image formats can I convert to PDF?",
      "Any raster format your browser can decode, which in practice covers JPG, JPEG, PNG, WebP, GIF and BMP. Everything is normalised to JPEG at quality 0.95 during embedding, so the output is a consistent single-format PDF regardless of what went in.",
    ],
    [
      "In what order do the images appear in the PDF?",
      "In the order you added them, one image per page, top of the list first. Remove and re-add a file if you need it somewhere else in the sequence.",
    ],
    [
      "Are my images uploaded to a server?",
      "No. The files are read locally, drawn to a canvas in the page and assembled into the PDF by pdf-lib running in your browser, so sensitive documents such as ID scans and receipts stay on your machine.",
    ],
    [
      "Why is my PDF page a strange size?",
      "Because the page is created at the image's pixel dimensions in PDF points, and a PDF point is 1/72 inch — so a 3000 x 4000 pixel photo produces a page about 41 x 55 inches. It prints fine, since printers scale to fit the paper, but set your print dialog to fit-to-page if you need an exact paper size.",
    ],
  ],
};

export default seo;
