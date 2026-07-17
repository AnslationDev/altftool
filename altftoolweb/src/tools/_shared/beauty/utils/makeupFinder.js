"use client";

export const MAKEUP_CATEGORIES = {
  foundation: { name: "Foundation", desc: "Even skin tone coverage" },
  concealer: { name: "Concealer", desc: "Brighten under-eyes and blemishes" },
  blush: { name: "Blush", desc: "Healthy cheek flush" },
  lipstick: { name: "Lipstick", desc: "Accentuate lip color" },
  eyeshadow: { name: "Eyeshadow", desc: "Define eyes" },
  bronzer: { name: "Bronzer", desc: "Sun-kissed warmth" },
};

export function generateShadeRecommendations(skinRgb, undertone, depth) {
  const isLight = depth < 40;
  const isMedium = depth >= 40 && depth < 70;
  
  const recommendations = {};

  let foundationHex = "#F3C29E";
  let foundationName = "Light Ivory (Warm)";
  if (undertone === "Cool") {
    foundationHex = isLight ? "#F8D4C0" : isMedium ? "#E4A182" : "#9C5C3F";
    foundationName = isLight ? "Cool Porcelain" : isMedium ? "Cool Beige" : "Cool Chestnut";
  } else {
    foundationHex = isLight ? "#F5D6B6" : isMedium ? "#DCA17C" : "#8A4D2E";
    foundationName = isLight ? "Warm Sand" : isMedium ? "Warm Honey" : "Warm Espresso";
  }
  recommendations.foundation = [
    { name: foundationName, hex: foundationHex, brand: "Pro Finish Foundation" }
  ];

  recommendations.concealer = [
    { name: isLight ? "Fair Concealer" : isMedium ? "Medium Ochre" : "Deep Bronze", hex: isLight ? "#FDF0D5" : isMedium ? "#E4BE9E" : "#AD7853", brand: "Radiant Skin Concealer" }
  ];

  recommendations.blush = [
    { name: undertone === "Cool" ? "Soft Pink" : "Warm Coral", hex: undertone === "Cool" ? "#FDA4AF" : "#FB923C", brand: "Cheek Flush Blush" }
  ];

  recommendations.lipstick = [
    { name: undertone === "Cool" ? "Berry Rose" : "Warm Peach Nude", hex: undertone === "Cool" ? "#BE185D" : "#C2410C", brand: "Silk Velvet Lipstick" }
  ];

  recommendations.eyeshadow = [
    { name: "Nude Shimmer", hex: "#E9D5FF", brand: "Classic Glow Palette" },
    { name: "Warm Bronze", hex: "#A16207", brand: "Classic Glow Palette" }
  ];

  recommendations.bronzer = [
    { name: isLight ? "Light Golden" : isMedium ? "Medium Terracotta" : "Deep Cocoa", hex: isLight ? "#EAB308" : isMedium ? "#CA8A04" : "#451A03", brand: "Sunkissed Bronzer" }
  ];

  return recommendations;
}
