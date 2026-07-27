const seo = {
  intro:
    "This checker tests a product photo against Shopify's published image limits before you upload it: a maximum of 20 megapixels, a maximum file size of 20 MB, a minimum of 800 x 800 px for product-page zoom, and 2048 x 2048 px as the recommended square size. It also compares the image to the single aspect ratio your store uses and reports how much a centre crop to that shape would remove, because Shopify's own advice is to keep one ratio across every product so collection grids line up.",
  useCases: [
    "Check whether a 24 megapixel camera export will be refused before you drag 200 files into the admin.",
    "Find out why zoom is not working on a product page shot at 600 x 600 px.",
    "See how much of a square photo is lost when your theme crops to a 4:5 portrait grid.",
    "Confirm a HEIC file straight off an iPhone is supported without converting it first.",
  ],
  benefits: [
    ["Hard limits first", "The 20 MP and 20 MB ceilings are the two that actually block an upload, and they are checked separately."],
    ["Crop maths, not guesswork", "Reports the exact percentage a centre crop to your store ratio removes."],
    ["Grid consistency", "Flags an image that will leave uneven padding next to the rest of your catalogue."],
  ],
  faqs: [
    [
      "What is the best image size for Shopify products?",
      "2048 x 2048 pixels for square product photos. That is Shopify's own recommendation: it is large enough for a sharp zoom on retina screens and comfortably under the 20 megapixel ceiling, and Shopify generates all the smaller variants automatically.",
    ],
    [
      "What are Shopify's image upload limits?",
      "20 megapixels of resolution and 20 MB per file. A 6000 x 4000 px camera export is 24 megapixels and will be refused, so downscale before uploading rather than after a failed batch.",
    ],
    [
      "Why is zoom not working on my Shopify product images?",
      "Product-page zoom needs at least 800 x 800 pixels. Below that there is nothing extra to magnify, so most themes disable the zoom cursor entirely.",
    ],
    [
      "Do all my product images need the same aspect ratio?",
      "Shopify recommends it. Collection grids reserve a fixed frame for every product, so mixing square and portrait photos leaves uneven white padding down the page. Pick one ratio — 1:1 and 4:5 are the common choices — and crop everything to it.",
    ],
  ],
};

export default seo;
