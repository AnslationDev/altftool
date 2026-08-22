const seo = {
  title: "HEIC to JPG Converter: Batch, PNG & PDF Output",
  metaDescription:
    "Convert iPhone HEIC/HEIF photos to JPG, PNG or one-page PDF in your browser — batch queue, 10-100 quality slider, per-file downloads or one ZIP.",
  steps: [
    "Drop .heic or .heif files onto the 'Choose HEIC Files' area (multiple files allowed); each queued photo shows its name and size.",
    "Pick JPG, PNG or PDF under 'Output Format', set the 'Image Compression Quality' slider (10-100%), then click 'Convert HEIC to JPG' (or PNG/PDF).",
    "Save each converted image with its 'Download' button, or click 'Download All as ZIP' to get the whole batch in one archive.",
  ],
  intro:
    "This converter decodes Apple's HEIC and HEIF photos in the browser and re-encodes them as JPG, PNG or a one-page PDF, with a quality slider from 10 to 100 controlling the JPEG compression level. Drop in a whole camera roll at once, convert the batch, then download files individually or as a single ZIP. It is for anyone who has iPhone photos that Windows, an older editor, a web upload form or a print shop refuses to open.",
  useCases: [
    "You emailed yourself twenty iPhone photos and the recipient on Windows cannot open a single .heic attachment.",
    "A job application or government portal only accepts JPG under a size limit, and dropping quality to around 70 gets the file small enough.",
    "You need a scanned receipt photographed on an iPhone turned into a PDF page to attach to an expense claim.",
  ],
  benefits: [
    ["Three output targets", "The same drop produces JPG, PNG or a PDF sized to the image's own pixel dimensions, not a fixed page."],
    ["Real batch handling", "Every file gets its own status and size readout, and finished conversions zip up in one download."],
    ["Quality you control", "A 10-100 slider sets the JPEG quality directly, so you can trade sharpness for file size deliberately."],
  ],
  faqs: [
    [
      "Why can't Windows open my iPhone HEIC photos?",
      "HEIC is a HEIF container using HEVC compression, which Windows does not decode without the paid HEVC Video Extensions codec from the Microsoft Store. Converting to JPG or PNG sidesteps the codec entirely, since both open natively everywhere.",
    ],
    [
      "What quality setting should I use for HEIC to JPG?",
      "Around 90 is the default and is visually indistinguishable from the original for most photos. Drop to 70-80 when you need a much smaller file for email or an upload limit; below about 50 you will start to see blocking around edges and in smooth gradients such as skies.",
    ],
    [
      "Are my photos uploaded to a server?",
      "No. Decoding runs in the browser tab through the heic2any library and the files never leave your device — you can watch the network panel during a conversion and see no upload. Batch ZIPs are also assembled locally.",
    ],
    [
      "Does converting keep the EXIF data and GPS location?",
      "Not reliably — re-encoding through the browser canvas typically drops EXIF, including camera settings and GPS coordinates. That is useful if you are stripping location before sharing, but if you need the original capture metadata, keep the .heic file alongside the converted copy.",
    ],
  ],
};

export default seo;
