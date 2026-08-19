export const TOOLS = [
  // Page Tools
  {
    name: "Merge PDF",
    slug: "merge-pdf",
    panelId: "merge",
    desc: "Combine multiple PDF files into a single document.",
    icon: "#s-merge",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },
  {
    name: "Split PDF",
    slug: "split-pdf",
    panelId: "split",
    desc: "Extract specific pages or page ranges into separate PDFs.",
    icon: "#s-cut",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },
  {
    name: "Rotate PDF",
    slug: "rotate-pdf",
    panelId: "rotate",
    desc: "Rotate pages clockwise or counter-clockwise and save.",
    icon: "#s-rot",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },
  {
    name: "Organize Pages",
    slug: "organize-pdf",
    panelId: "organize",
    desc: "Reorder, drag-and-drop, or delete pages from a PDF.",
    icon: "#s-list",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },
  {
    name: "Crop Pages",
    slug: "crop-pdf",
    panelId: "crop",
    desc: "Trim page margins by defining top, bottom, left, and right margins.",
    icon: "#s-crop",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },
  {
    name: "Insert Blank Pages",
    slug: "insert-blank-pages",
    panelId: "insertblank",
    desc: "Add empty pages at the start, end, or specific pages.",
    icon: "#s-plus",
    category: "Page Tools",
    sidebarCategory: "Page Tools"
  },

  // Convert & Export
  {
    name: "Image → PDF",
    slug: "image-to-pdf",
    panelId: "img2pdf",
    desc: "Convert JPG, PNG, and WebP images into a single PDF.",
    icon: "#s-img",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "PDF → Image",
    slug: "pdf-to-image",
    panelId: "pdf2img",
    desc: "Render PDF pages into JPEG images for downloading.",
    icon: "#s-cam",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "PDF → Text",
    slug: "pdf-to-text",
    panelId: "pdf2text",
    desc: "Extract raw plain text from a searchable PDF document.",
    icon: "#s-type",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "Extract Images",
    slug: "extract-images",
    panelId: "extractimages",
    desc: "Find and download all embedded images inside a PDF.",
    icon: "#s-extract",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "Webpage → PDF",
    slug: "webpage-to-pdf",
    panelId: "web2pdf",
    desc: "Convert a saved webpage (.html file or pasted HTML source) into a PDF document.",
    icon: "#s-globe",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "Grayscale PDF",
    slug: "grayscale-pdf",
    panelId: "grayscale",
    desc: "Convert a colored PDF's text and assets to black-and-white.",
    icon: "#s-gray",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    panelId: "pdf2excel",
    desc: "Extract text grids and tables from PDF pages to Excel sheets.",
    icon: "#s-convert",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "PDF to Word",
    slug: "pdf-to-word",
    panelId: "pdf2word",
    desc: "Convert PDF pages to editable Microsoft Word files (.docx).",
    icon: "#s-convert",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "Compress PDF",
    slug: "compress-pdf",
    panelId: "compress",
    desc: "Reduce PDF file sizes while maintaining layout quality.",
    icon: "#s-cmp",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },
  {
    name: "Repair PDF",
    slug: "repair-pdf",
    panelId: "repair",
    desc: "Recover data and reconstruct corrupted structural indexes of PDFs.",
    icon: "#s-flat",
    category: "Convert & Export",
    sidebarCategory: "Convert"
  },

  // Enhance & Security
  {
    name: "Page Numbers",
    slug: "page-numbers",
    panelId: "pagenumbers",
    desc: "Number PDF pages at custom positions with styling.",
    icon: "#s-hash",
    category: "Enhance & Security",
    sidebarCategory: "Enhance"
  },
  {
    name: "Header / Footer",
    slug: "header-footer",
    panelId: "headerfooter",
    desc: "Add custom headers, footers, or text margins to a PDF.",
    icon: "#s-hf",
    category: "Enhance & Security",
    sidebarCategory: "Enhance"
  },
  {
    name: "Watermark PDF",
    slug: "watermark-pdf",
    panelId: "watermark",
    desc: "Overlay text or image watermarks onto PDF pages.",
    icon: "#s-wm",
    category: "Enhance & Security",
    sidebarCategory: "Enhance"
  },
  {
    name: "Redact PDF",
    slug: "redact-pdf",
    panelId: "redact",
    desc: "Draw black censor boxes over sensitive details.",
    icon: "#s-redact",
    category: "Enhance & Security",
    sidebarCategory: "Enhance"
  },
  {
    name: "Sign PDF",
    slug: "sign-pdf",
    panelId: "sign",
    desc: "Type, draw, or upload your signature to place on pages.",
    icon: "#s-edit",
    category: "Enhance & Security",
    sidebarCategory: "Security"
  },
  {
    name: "Edit Metadata",
    slug: "edit-metadata",
    panelId: "metadata",
    desc: "Modify title, author, subject, and keyword meta fields.",
    icon: "#s-edit",
    category: "Enhance & Security",
    sidebarCategory: "Enhance"
  },
  {
    name: "Protect PDF",
    slug: "protect-pdf",
    panelId: "protect",
    desc: "Encrypt a PDF with user and owner passwords.",
    icon: "#s-lock",
    category: "Enhance & Security",
    sidebarCategory: "Security"
  },
  {
    name: "Unlock PDF",
    slug: "unlock-pdf",
    panelId: "unlock",
    desc: "Decrypt and remove passwords from locked PDF files.",
    icon: "#s-unlk",
    category: "Enhance & Security",
    sidebarCategory: "Security"
  },
  {
    name: "Flatten PDF",
    slug: "flatten-pdf",
    panelId: "flatten",
    desc: "Merge fillable PDF forms and annotations into page layers.",
    icon: "#s-flat",
    category: "Enhance & Security",
    sidebarCategory: "Security"
  },
  {
    name: "PDF Info",
    slug: "pdf-info",
    panelId: "info",
    desc: "Inspect a PDF file's security, page counts, and version details.",
    icon: "#s-info",
    category: "Enhance & Security",
    sidebarCategory: "Inspect"
  },
  {
    name: "Compare PDF",
    slug: "compare-pdf",
    panelId: "compare",
    desc: "Compare two PDF documents side-by-side or highlight visual differences.",
    icon: "#s-eye",
    category: "Enhance & Security",
    sidebarCategory: "Inspect"
  },

  // Image Tools
  {
    name: "Image Resizer",
    slug: "image-resizer",
    panelId: "imgresize",
    desc: "Resize images by exact pixels, percentage, or fit box.",
    icon: "#s-resize",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Image Compress",
    slug: "image-compress",
    panelId: "imgcompress",
    desc: "Reduce image file size with optimized compression.",
    icon: "#s-imgcmp",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Image Crop",
    slug: "image-crop",
    panelId: "imgcrop",
    desc: "Crop an image by drawing a custom bounding selection.",
    icon: "#s-scissors",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Rotate Image",
    slug: "rotate-image",
    panelId: "imgrotate",
    desc: "Rotate or flip images vertically/horizontally in-browser.",
    icon: "#s-rot",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Remove Background",
    slug: "remove-background",
    panelId: "imgremovebg",
    desc: "Remove image backgrounds automatically and 100% locally.",
    icon: "#s-extract",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Meme Generator",
    slug: "meme-generator",
    panelId: "imgmeme",
    desc: "Create custom memes with text captions and outline controls.",
    icon: "#s-type",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "EXIF Metadata Remover",
    slug: "exif-remover",
    panelId: "imgexif",
    desc: "Strip location GPS, camera tags, and device signatures from images.",
    icon: "#s-unlk",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },
  {
    name: "Format Convert",
    slug: "format-convert",
    panelId: "imgconvert",
    desc: "Convert image files to JPEG, PNG, WebP, or GIF.",
    icon: "#s-convert",
    category: "Image Tools",
    sidebarCategory: "Image Tools"
  },

  // Advanced
  {
    name: "PDF Preview",
    slug: "pdf-preview",
    panelId: "pdfpreview",
    desc: "View any PDF file inside a clean HTML container.",
    icon: "#s-eye",
    category: "Advanced",
    sidebarCategory: "Advanced"
  },
  {
    name: "HTML → PDF",
    slug: "html-to-pdf",
    panelId: "html2pdf",
    desc: "Convert HTML files, raw code, or screenshots to PDF.",
    icon: "#s-html",
    category: "Advanced",
    sidebarCategory: "Advanced"
  },
  {
    name: "Batch Process",
    slug: "batch-process",
    panelId: "batch",
    desc: "Apply compression, rotation, or grayscale to multiple PDFs.",
    icon: "#s-batch",
    category: "Advanced",
    sidebarCategory: "Advanced"
  }
];

export const HOMEPAGE_CATEGORIES = [
  "Page Tools",
  "Convert & Export",
  "Enhance & Security",
  "Image Tools",
  "Advanced"
];

export const SIDEBAR_CATEGORIES = [
  "Page Tools",
  "Convert",
  "Enhance",
  "Security",
  "Inspect",
  "Image Tools",
  "Advanced"
];
