const seo = {
  title: "Annotate PDF Online Free — Highlight, Draw & Sign",
  h1: "PDF Annotation Tool — Highlight, Draw and Sign PDFs",
  metaDescription:
    "Free online PDF annotator: highlight, draw, add text, shapes and signatures on PDFs up to 80 MB, then export an annotated PDF. Runs in your browser.",
  intro:
    "The PDF Annotation Tool renders your document with Mozilla's PDF.js (v3.11.174) at a 1.8× viewport scale onto an HTML canvas, then lets you draw a second layer on top of it — pen strokes, 40%-opacity highlights, rectangles, circles, arrows, text and signatures — with an RGB slider picker for colour. Your file is read locally through the browser's FileReader API into a Uint8Array, so the PDF bytes never leave your device; only the PDF.js library itself is fetched from a CDN. Exporting rebuilds every page through jsPDF, writing each annotated canvas as a JPEG at quality 0.95 into a page sized in points to match the rendered canvas.",
  useCases: [
    "Mark up a contract or proposal with highlights, arrows and margin notes before sending feedback back to a colleague.",
    "Place a handwritten, typed or uploaded signature image on a form and export the whole document as one annotated PDF.",
    "Circle and label a figure in a research paper or spec sheet, then export just that page as a PNG to drop into a message or slide.",
  ],
  benefits: [
    [
      "Eight tools on one canvas",
      "Pen, highlighter, rectangle, circle, arrow, text, signature and eraser share a single annotation layer, with an RGB slider picker (0–255 per channel) driving the colour of whichever tool is active.",
    ],
    [
      "Signatures three ways",
      "Draw on a 350×150 pad, type a name that renders in 40px serif, or upload an image. The result is placed as a 150×60 stamp you can drag anywhere on the page.",
    ],
    [
      "Undo, redo and per-page clear",
      "Every action snapshots the full annotation list, so undo and redo step cleanly back and forth. The eraser removes pen strokes within 10px of the click and shapes by bounding box.",
    ],
    [
      "The file stays on your device",
      "The PDF is read with FileReader and rendered by PDF.js in the page — nothing is uploaded, and there is no account or sign-up.",
    ],
  ],
  faqs: [
    [
      "How do I annotate a PDF for free without Acrobat?",
      "Upload the PDF here and annotate it in the browser — no install, no account. Pick pen, highlighter, rectangle, circle, arrow, text, signature or eraser from the toolbar, draw directly on the page, then press Export PDF to download the annotated copy.",
    ],
    [
      "Is my PDF uploaded to a server?",
      "No. The file is read locally with the browser's FileReader API and rendered on your own device by PDF.js; the annotated PDF is assembled in the page by jsPDF and saved straight to your downloads. The only thing fetched over the network is the PDF.js library and worker script from a public CDN — never your document.",
    ],
    [
      "What is the maximum PDF size I can annotate?",
      "80 MB. Anything larger is rejected with a message before rendering starts. There is no page limit, but every page is rasterised at 1.8× scale and held in memory, so very long documents will use more RAM and take longer to export.",
    ],
    [
      "Will the text in my exported PDF still be searchable?",
      "No — the export is flattened. Each page is drawn to a canvas and embedded as a JPEG at quality 0.95, so the original text layer is replaced by an image. That makes the annotations permanent and impossible to move, but it also means the exported file cannot be searched, selected or copied from. Keep the original if you need the text layer.",
    ],
    [
      "Can I add a signature to a PDF here?",
      "Yes, in three ways: draw one with the mouse on a 350×150 signature pad, type your name (rendered at 40px in a serif face), or upload an image of an existing signature. It is placed as a 150×60 image you can drag into position. This produces a visible signature drawn onto the page — it is not a cryptographic digital signature backed by a certificate.",
    ],
    [
      "Can I annotate a PDF on my phone?",
      "Not reliably. The drawing canvas listens for mouse events (mousedown, mousemove, mouseup), so a mouse or trackpad is needed to draw, drag and erase. On a touchscreen you can still upload a file and browse pages, but strokes will not register.",
    ],
    [
      "Why won't my PDF load?",
      "Most often the file is password-protected or corrupted — PDF.js cannot open encrypted documents, and the tool reports this rather than showing a blank page. The other common cause is uploading before the engine has finished loading; the Upload button stays disabled and reads \"Loading engine...\" until PDF.js is ready.",
    ],
    [
      "Can I export only one page?",
      "Yes. The PNG button saves just the page currently on screen, at the zoom level you are viewing it, named after the source file plus the page number. Export PDF always writes every page of the document, annotated or not.",
    ],
  ],
  steps: [
    "Click Upload PDF and choose a file up to 80 MB. PDF.js renders every page at 1.8× scale and builds a thumbnail strip so you can jump between pages.",
    "Pick a tool — pen, highlighter, rectangle, circle, arrow, text, signature or eraser — set the colour with the RGB sliders, and draw on the page. Text and signature marks can be dragged; undo, redo and zoom (0.5×–2×) are always available.",
    "Press Export PDF to download every page with annotations burned in, or PNG to save just the page you are looking at. Copy Summary puts the file name, size, page count and a breakdown of annotations by type on your clipboard.",
  ],
};

export default seo;
