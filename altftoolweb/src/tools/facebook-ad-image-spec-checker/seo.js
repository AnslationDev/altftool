const seo = {
  intro:
    "This checker tests a Facebook ad image against the placement rules published in Meta's Ads Guide: file type, the 30 MB size ceiling, the 1.91:1 to 1:1 feed ratio range with its 3% tolerance, the 600 x 600 px feed minimum, the 4:5 vertical and 9:16 story ratios, and the 1080 px resolution Meta recommends. It also flags heavy text overlay, which stopped being a rejection reason in 2020 but still affects delivery. Media buyers and designers use it to catch a rejection before the creative reaches Ads Manager.",
  useCases: [
    "Confirm a 1200 x 628 link image will run in both the feed and the right column before a launch.",
    "Check whether a 4:5 vertical creative meets the minimum height for the feed placement.",
    "Work out why a square creative under 600 px is being rejected at upload.",
    "Decide whether a text-heavy sale graphic is likely to see reduced delivery.",
  ],
  benefits: [
    ["Placement by placement", "Shows exactly which of the four standard image placements accept the file and why the others do not."],
    ["Real tolerances", "Applies Meta's documented 3% aspect-ratio tolerance instead of demanding an exact ratio."],
    ["Separates fail from warn", "A wrong file type fails; a below-recommended resolution only warns, so you know what actually blocks the upload."],
  ],
  faqs: [
    [
      "What size should a Facebook ad image be?",
      "1080 x 1080 px is the safest single size for feed placements — Meta recommends at least 1080 px on both sides and accepts ratios from 1.91:1 through 1:1, with a minimum of 600 x 600 px. Use 1080 x 1920 px at 9:16 for Stories and Reels, and 1080 x 1350 px at 4:5 for vertical feed.",
    ],
    [
      "Does Facebook still enforce the 20% text rule?",
      "No. Meta retired the hard 20% text limit and its text-overlay tool in 2020, so an ad is no longer rejected for text coverage. Text-heavy creative can still get less delivery in the auction, which is why this tool reports it as a warning rather than a failure.",
    ],
    [
      "What is the maximum file size for a Facebook ad image?",
      "30 MB for image ads. In practice a well-compressed JPEG at 1080 x 1080 px lands well under 1 MB, so hitting the ceiling usually means the file was exported at print resolution by mistake.",
    ],
    [
      "Which file formats does Meta accept for image ads?",
      "JPG and PNG. GIF, WebP and TIFF are not accepted for standard image ads, so convert before uploading. Use PNG when the creative contains flat colour or crisp type, and JPG for photography.",
    ],
  ],
};

export default seo;
