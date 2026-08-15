const seo = {
  title: "Document Scanner: 4-Corner Perspective Fix",
  metaDescription:
    "Drag four corners onto a page photo to remove the keystone, tune brightness, contrast and B&W threshold, then download PNG or JPEG. No upload.",
  steps: [
    "Press 'Upload document photo' for a PNG, JPEG, WebP or other browser-supported image up to 30 MB, or 'Use device camera' then 'Capture document'.",
    "Drag the four crop corners onto the page edges — arrow keys nudge them, Shift takes larger steps — then choose Color, Grayscale or Black & white and set brightness, contrast and threshold.",
    "Pick PNG or JPEG under 'File format' and press 'Download cleaned image' to save yourfile-cleaned.png locally.",
  ],
  intro:
    "This scanner turns a phone photo of a page into a flat, straight, readable scan by dragging four corners onto the document and applying a perspective transform that maps that quadrilateral back to a rectangle. It solves a full 8-parameter homography — the same projective correction a desk scanner avoids by holding the page flat — then applies brightness, contrast and an optional grayscale or black-and-white pass using Rec. 709 luminance weights before exporting PNG or JPEG. It is for anyone who needs a clean copy of an ID, a receipt or a signed form without sending that page to a scanning app's servers.",
  useCases: [
    "A landlord asks for a scan of a signed agreement and all you have is a slightly angled photo taken on a desk.",
    "You are submitting an expense claim and the receipt photo has a keystoned edge and a shadow across the total.",
    "Digitising a stack of handwritten notes into high-contrast black-and-white pages that stay legible after compression.",
  ],
  benefits: [
    ["Corrects perspective, not just crop", "The four-corner homography removes the keystone from an angled photo, so the page edges come out parallel instead of trapezoidal."],
    ["Corner nudging with the keyboard", "Each crop handle takes arrow keys, with Shift for larger steps, so you can place an edge exactly rather than fighting a touch drag."],
    ["Camera capture stays in the tab", "Shoot the page from the browser camera and the frame goes straight into the editor without a round trip to any server."],
  ],
  faqs: [
    [
      "How large a photo can I load?",
      "Up to 30 MB and 80 megapixels. Very large images are downscaled to 12 megapixels for editing, and the exported scan is capped at 6 megapixels and 3000 pixels on its longest side to keep the file practical to email.",
    ],
    [
      "What does the black-and-white mode actually do?",
      "It converts each pixel to Rec. 709 luminance (0.2126 red, 0.7152 green, 0.0722 blue) and pushes it to pure white or pure black against a threshold you control, which defaults to 155 of 255. Lower the threshold if faint pencil is disappearing, raise it if a grey shadow is coming through as black.",
    ],
    [
      "Should I export PNG or JPEG?",
      "PNG for text you plan to read or OCR later, especially in black-and-white mode where it compresses very small and stays crisp. JPEG, with a quality slider defaulting to 90%, is the better choice for colour photos of documents where file size matters more than exact edges.",
    ],
    [
      "Is my document uploaded for processing?",
      "No. Decoding, the perspective warp, the tone adjustments and the final encode all run on a canvas in your browser, so a passport page or a payslip never leaves the tab.",
    ],
  ],
};

export default seo;
