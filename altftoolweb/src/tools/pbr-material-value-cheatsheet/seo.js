const seo = {
  title: "PBR Albedo, F0 & Roughness Values Cheatsheet",
  metaDescription:
    "Measured F0 for metals, dielectric albedo and roughness ranges in linear and 8-bit sRGB, with a validator that flags implausible base colours.",
  steps: [
    "Enter your texture's Base colour R, G and B (0-255 sRGB) plus Metallic (0 or 1) and Roughness (0-1) under Check a base colour.",
    "Read the check output - linear values, relative luminance, GGX alpha, Blinn-Phong exponent and the closest reference material - with any out-of-range channels flagged.",
    "Look up measured figures in the Reference values table via the Search materials box (gold, concrete, metal...), or press Copy values to copy the whole check.",
  ],
  intro:
    "This cheatsheet lists the reflectance values physically based rendering expects: measured F0 for metals, diffuse albedo for dielectrics, and the roughness ranges each finish usually falls in. It converts every value between linear light and 8-bit sRGB using the IEC 61966-2-1 transfer function, derives F0 from an index of refraction with F0 = ((n − 1) / (n + 1))², and flags base colours that sit outside the plausible authoring window. It is written for 3D artists authoring metallic-roughness materials.",
  useCases: [
    "Check whether a hand-painted base colour is too dark before it kills every bounce in the lighting.",
    "Look up gold, copper or aluminium reflectance instead of eyedropping a photo that already has lighting baked in.",
    "Convert a specular-gloss value to metallic-roughness when porting an older asset library.",
    "Settle an argument about how bright concrete or asphalt should actually be in a scene.",
  ],
  benefits: [
    ["Linear and sRGB side by side", "Every material shows both, so you paste the right one into the right slot."],
    ["Range checking, not vibes", "The validator names the specific channel that falls outside the dielectric window."],
    ["F0 from IOR", "The Fresnel equation is applied directly, so glass lands on 0.04 and water on 0.020."],
  ],
  faqs: [
    [
      "What base colour value should a dielectric have?",
      "Keep every channel roughly between 50 and 243 in 8-bit sRGB. Fresh asphalt and charcoal, about the darkest real surfaces, encode to around 56, and fresh snow, about the brightest, reaches only about 232 — pure black or pure white base colours cannot occur in nature.",
    ],
    [
      "What is the F0 value for a non-metal?",
      "Most dielectrics sit near 0.04, which is what an index of refraction of 1.5 gives through F0 = ((n − 1) / (n + 1))². Water is lower at about 0.020 (n = 1.333) and diamond much higher at about 0.172 (n = 2.42).",
    ],
    [
      "Should metallic ever be a value between 0 and 1?",
      "No, other than in the blend pixels where a metal meets a coating, dirt or paint layer. A surface is either a conductor or it is not, so intermediate metallic values usually mean the mask needs fixing rather than the value.",
    ],
    [
      "How do I convert roughness to a Blinn-Phong specular exponent?",
      "Square the roughness to get the GGX alpha term, then use exponent = 2 / alpha² − 2. A roughness of 0.5 gives alpha 0.25 and an exponent of 30; the conversion is approximate and breaks down as roughness approaches zero.",
    ],
  ],
};

export default seo;
