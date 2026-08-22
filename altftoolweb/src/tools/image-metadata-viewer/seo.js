const seo = {
  title: "EXIF Viewer: Check a Photo's GPS, Camera & Dates",
  steps: [
    "Drop a photo on the 'Upload an image' zone or click to browse — it takes .jpg, .png, .webp, .gif, .tiff and .bmp, with full EXIF only from JPEG.",
    "Read the Camera, Exposure, GPS, Dates and Software sections, or open the Privacy tab, where GPS Location is rated high and Author Name medium.",
    "On the Export tab press JSON, TXT or CSV to download the tags as filename-metadata.json, .txt or .csv.",
  ],
  intro:
    "Image Metadata Viewer reads the EXIF block out of a JPEG's APP1 segment in your browser and lays it out in six sections — File Info, Camera, Exposure, GPS, Dates and Software — including make and model, lens, shutter speed, f-number, ISO, orientation and decoded GPS latitude and longitude. It then runs a privacy pass that flags embedded coordinates as high risk, an Artist name as medium, a copyright string as low and editing software as informational, and warns when two or more personal identifiers appear together. You can export everything as JSON, plain text or CSV before deciding what to strip.",
  useCases: [
    "You are about to post a photo taken at home and want to check whether the file still carries the GPS coordinates your phone wrote into it.",
    "A photo's provenance is in question and you want the original capture date, camera model and lens straight from the file rather than the date the operating system shows.",
    "You are assembling an evidence or asset log and need the full tag list as CSV so it can go into a spreadsheet alongside the filenames.",
  ],
  benefits: [
    [
      "Decodes GPS into usable coordinates",
      "Reads the GPS IFD and converts the degrees/minutes/seconds rationals plus N/S and E/W references into a plain latitude and longitude, including altitude below sea level.",
    ],
    [
      "Rates what it finds, not just lists it",
      "Coordinates, author name, copyright and software each get a risk level, and two or more personal identifiers together are called out as combined exposure.",
    ],
    [
      "Three export formats from the same read",
      "The same parsed tag set downloads as JSON for tooling, plain text for a note, or CSV for a spreadsheet.",
    ],
  ],
  faqs: [
    [
      "Does my photo have GPS location data in it?",
      "Load it and check the GPS section: if your camera or phone recorded a position, the latitude, longitude and often altitude and a GPS timestamp will be listed, and the privacy panel flags it as a high risk. Phones commonly embed coordinates accurate enough to identify a specific address, which is why it is the first thing to strip before public sharing.",
    ],
    [
      "Which image formats can it read metadata from?",
      "Full EXIF extraction works on JPEG, because the parser walks JPEG markers to find the APP1 EXIF segment. PNG, WebP, GIF, TIFF and BMP files load and show file properties and colour analysis, but they will not produce a camera and exposure tag list here.",
    ],
    [
      "Is my image uploaded anywhere when I check its metadata?",
      "No. The file is read as an ArrayBuffer and parsed by JavaScript in the page, and the colour palette is sampled from a canvas locally, so an image you are checking precisely because it may be sensitive never leaves the device.",
    ],
    [
      "Does this tool remove metadata from my photo?",
      "No, it only reads and exports it. To strip tags you need an editor or a dedicated remover; note that many social platforms strip EXIF on upload, but messaging apps and direct file sends often do not, so do not rely on the platform.",
    ],
  ],
};

export default seo;
