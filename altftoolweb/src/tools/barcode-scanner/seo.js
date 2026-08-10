const seo = {
  title: "Barcode Scanner Online: EAN, UPC, Code 128 and QR",
  metaDescription:
    "Decode a barcode from an uploaded image or your camera: native BarcodeDetector, then jsQR, then Quagga. Copy the value or export .txt or JSON.",
  intro:
    "The Barcode Scanner decodes a barcode or QR code from an uploaded image or a live camera feed by running a three-stage pipeline: the browser's native BarcodeDetector first, then jsQR for QR codes with both polarities attempted, then Quagga for the 1D retail and logistics symbologies. It reports the decoded value together with the detected format — EAN-13, UPC-A, Code 128, Data Matrix, PDF417 and more — and keeps a local history of recent scans. It is for anyone who needs the number behind a barcode without installing a scanner app.",
  useCases: [
    "You photographed a product label and need the EAN-13 to look up the item, but your phone's camera app will not hand you the digits.",
    "A supplier sent a PDF or screenshot with a Code 128 shipping barcode and you need it as text to paste into a tracking form.",
    "You are testing QR codes you generated and want to confirm what they actually encode before printing them.",
  ],
  benefits: [
    [
      "Three decoders, tried in order",
      "If the native BarcodeDetector is missing or returns nothing, jsQR runs with attemptBoth inversion for inverted QR codes, and Quagga then attempts EAN, EAN-8, UPC, UPC-E, Code 128, Code 39, Codabar and ITF.",
    ],
    [
      "Upload or live camera, same engine",
      "Camera frames use the fast native-plus-jsQR path so the loop stays smooth, while still images get the full pipeline including the slower 1D readers.",
    ],
    [
      "The result is exportable, not just displayed",
      "Copy the value, download it as a .txt, or export a JSON record with the format, image dimensions, source and an ISO timestamp.",
    ],
  ],
  faqs: [
    [
      "Which barcode formats can it read?",
      "QR Code plus EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39 and Codabar and ITF through the JavaScript readers, and additionally Code 93, Data Matrix, Aztec and PDF417 wherever your browser's native BarcodeDetector supports them.",
    ],
    [
      "Does it work without a camera?",
      "Yes. Upload mode decodes any image file — a photo, a screenshot, or an exported label — and the image is drawn to a canvas capped at 1600 pixels on its longest edge before decoding.",
    ],
    [
      "Are my images or scans uploaded anywhere?",
      "The uploaded image or live camera frames stay in your browser while decoding, and recent scans with their small thumbnails are stored in local storage on this device. After a code is decoded, its text or digits are sent to Open Food Facts and, if no product is found, UPCitemdb for the automatic product lookup.",
    ],
    [
      "Why does it say no barcode was detected?",
      "Usually blur, glare, or too little of the code in frame. Fill more of the picture with the barcode, keep it flat and in focus, and avoid reflections — the decoders need clean bar edges, and heavily damaged 1D codes often fail where a QR code would still recover.",
    ],
  ],
};

export default seo;
