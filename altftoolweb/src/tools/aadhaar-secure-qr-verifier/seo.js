const seo = {
  metaDescription:
    "Decode an Aadhaar QR image locally, identify legacy or Secure QR payloads, and preview the data without claiming signature verification.",
  intro:
    "This tool decodes the QR code printed on an Aadhaar letter or PVC card from an image you select, and tells you which of the two QR generations you are holding. It draws the image to a canvas, reads the code with a local QR decoder, then classifies the payload: a legacy PrintLetterBarcodeData XML block, or the newer binary Secure QR. It reports the payload size, the type and a 240-character preview — and it states plainly that the digital signature is not verified, rather than implying authenticity it cannot prove.",
  useCases: [
    "You have been sent a photo of an Aadhaar card and want to see whether its QR is the old XML kind or the current Secure QR before choosing how to process it",
    "You are building an eKYC integration and need to inspect the raw payload a scan actually produces to work out why your parser is failing",
    "A scanned document will not read on a verification app and you want to check whether the QR decodes at all or the scan is simply too low-resolution",
  ],
  benefits: [
    ["Tells the two QR generations apart", "Legacy XML payloads starting with PrintLetterBarcodeData are identified separately from the newer binary Secure QR format."],
    ["Shows the raw payload", "A preview of the decoded bytes lets you see what a scanner receives, which is what you need when debugging an integration."],
    ["Honest about what it does not do", "Signature status is reported as unverified instead of being presented as a pass, so no false assurance is attached to the result."],
  ],
  faqs: [
    [
      "Does this prove an Aadhaar card is genuine?",
      "No. It decodes the QR payload but does not validate the UIDAI digital signature attached to a Secure QR, so a successful decode says nothing about authenticity. Genuine verification requires UIDAI's own offline eKYC or authentication services, which check the signature against UIDAI's public certificate.",
    ],
    [
      "What is the difference between the old QR and Secure QR?",
      "The older QR encodes a plain XML block (PrintLetterBarcodeData) with demographic fields and no signature, so anyone can rewrite it. Secure QR, introduced later, encodes a compressed, digitally signed binary payload that can additionally carry a photo, and it is the signature that makes it tamper-evident.",
    ],
    [
      "Why does my image fail to decode?",
      "Usually resolution or contrast. A QR photographed at an angle, printed small, or compressed heavily loses the module edges the decoder needs. Rescan flat at a higher resolution, crop tightly to the QR, and avoid glare on laminated PVC cards.",
    ],
    [
      "Is my Aadhaar image uploaded when I use this?",
      "No. The image is drawn to a canvas and decoded by JavaScript running in your browser; no file, pixel data or decoded payload is transmitted. Aadhaar data is still sensitive, so avoid leaving decoded output on a shared screen and close the tab when finished.",
    ],
  ],
};

export default seo;
