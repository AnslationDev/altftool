const seo = {
  intro:
    "Image Quality Checker scores a photo on nine measured metrics — sharpness, brightness, contrast, noise, exposure, white balance, saturation, dynamic range and resolution — and combines them into one 0-100 score with a letter grade, weighting sharpness at 20%, noise and resolution at 15% each, brightness, contrast, exposure and white balance at 10% each, and saturation and dynamic range at 5% each. Every measurement runs on the image's real pixels through a canvas, using the standard 0.299R + 0.587G + 0.114B luma formula, alongside a luminance and per-channel RGB histogram. It ends with concrete suggestions such as which axis is dragging the score down, and a downloadable text report.",
  useCases: [
    "You have three near-identical shots from a burst and want an objective sharpness number to pick the keeper instead of squinting at thumbnails.",
    "A client photo looks flat on your monitor and you want to confirm whether the problem is contrast, a colour cast, or simply that the file is under a megapixel.",
    "You are checking a batch of product images before upload and need to catch the ones with blown highlights, where more than a few percent of pixels are near-white.",
  ],
  benefits: [
    [
      "A weighted score, not an average",
      "Sharpness carries 20% and resolution and noise 15% each, so a soft or tiny image cannot be rescued by good saturation.",
    ],
    [
      "Tells you which metric failed",
      "Low scores map to named suggestions — blurry, too dark, overexposed, flat contrast, noisy, colour cast, low resolution — instead of a single verdict.",
    ],
    [
      "Shows the histograms behind the numbers",
      "Luminance and separate R, G and B histograms let you confirm a clipping or cast diagnosis rather than take the score on faith.",
    ],
  ],
  faqs: [
    [
      "What counts as a good image quality score?",
      "The grade bands are A+ at 90 and above, A at 80, B+ at 70, B at 60, C+ at 50, C at 40 and D below that. Anything at 70 or above is treated as good in the readout, and the score gauge turns amber below 70 and red below 40.",
    ],
    [
      "How does it measure whether an image is blurry?",
      "It walks every pixel and sums the absolute luminance difference against its right-hand and lower neighbours, giving an average gradient magnitude that is then scaled to 0-100. Crisp edges produce large neighbour-to-neighbour differences, blurred ones produce small ones, and a sharpness score under 40 is called out as blurry.",
    ],
    [
      "What does the exposure score actually check?",
      "It counts pixels with luminance below 25 as underexposed and above 230 as overexposed, and starts deducting once either group passes 5% of the image. Above 20% in either direction the tool explicitly warns about significant shadow or highlight clipping.",
    ],
    [
      "Why is my image marked low resolution?",
      "The resolution score is stepped by total pixel count: under 0.1 MP scores 20, under 0.3 MP scores 40, under 0.6 MP scores 60, under 1 MP scores 80, and 1 MP or more scores 100. Since resolution is 15% of the total, a small crop or a downscaled web copy will cap the overall grade no matter how good it looks.",
    ],
  ],
};

export default seo;
