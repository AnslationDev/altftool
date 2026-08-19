const seo = {
  title: "JPG/JPEG/PNG Converter for Govt Form Uploads",
  metaDescription:
    "Convert a photo or signature to .jpg, .jpeg or PNG in your browser and auto-fit a JPEG under a KB limit like 20-50 KB — nothing is uploaded.",
  steps: [
    "Choose an Image file (JPG, JPEG or PNG) and the output format under Convert to.",
    "For JPEG output, pick the 'Extension the portal demands' (.jpg or .jpeg), set JPEG quality (0.05 – 1) or a Target max size in KB, then press Convert.",
    "Download the renamed file and check Original size, Converted size, dimensions and the JPEG quality used in the report.",
  ],
  intro:
    "This converter turns a photo or signature between JPG, JPEG and PNG entirely in the browser, writing the exact file extension a government portal's upload validator demands. JPG and JPEG are the same JPEG format — only the extension spelling differs — and the tool can also binary-search the JPEG quality to land under a KB limit such as the 20-50 KB photo rule common on Indian recruitment portals. Nothing is uploaded: the canvas re-encoding happens on your device.",
  useCases: [
    "An SSC or IBPS applicant whose portal rejects a .png signature and demands a .jpg under 20 KB",
    "A student whose scanner outputs .jpeg while the university form's validator only accepts the .jpg spelling",
    "An applicant flattening a transparent PNG signature onto a white background so it prints correctly on the admit card",
  ],
  benefits: [
    ["Exact extension control", "Choose .jpg or .jpeg output explicitly, because some portal validators accept only one spelling."],
    ["Hit a KB target", "Automatic quality search compresses a JPEG under the portal's size limit when physically possible."],
    ["No upload", "The image is converted with the browser's own canvas encoder and never leaves your device."],
  ],
  faqs: [
    [
      "Is there a difference between JPG and JPEG?",
      "No — they are the identical JPEG image format; JPG exists only because old Windows systems limited extensions to three letters. Some government portals' validators nonetheless check the extension string literally, which is why this tool lets you pick the exact spelling.",
    ],
    [
      "How do I convert PNG to JPG for a government form?",
      "Select the PNG, choose JPEG/JPG as the output, pick the extension the portal wants and press Convert. Because JPEG has no transparency, any transparent area in the PNG is flattened onto a background — white by default, which is what photo and signature specifications expect.",
    ],
    [
      "How does the tool make a JPEG smaller than a KB limit?",
      "It re-encodes the image at successively adjusted quality levels using a binary search over the JPEG quality parameter (up to 7 encodes), keeping the highest quality that still fits under your target. If even minimum quality cannot reach the target, the image's pixel dimensions are too large and need reducing first.",
    ],
    [
      "Does converting JPG to PNG improve quality?",
      "No — JPEG compression losses are permanent, and saving as PNG only preserves the already-lossy pixels in a lossless container, usually at a much larger file size. Convert to PNG only when a portal explicitly requires the PNG format.",
    ],
  ],
};

export default seo;
