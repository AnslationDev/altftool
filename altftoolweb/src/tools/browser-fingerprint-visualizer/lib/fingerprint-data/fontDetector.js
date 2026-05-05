

import { FONT_LIST } from "../../constants/font.js";

export function detectFonts() {
  try {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const baseFonts = ["monospace", "sans-serif", "serif"];

    
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const baselines = {};
    baseFonts.forEach((baseFont) => {
      ctx.font = `${testSize} ${baseFont}`;
      baselines[baseFont] = ctx.measureText(testString).width;
    });


    const detectedFonts = [];

    FONT_LIST.forEach((font) => {
      let detected = false;

      for (const baseFont of baseFonts) {
        // Measure with test font, falling back to baseline
        ctx.font = `${testSize} '${font}', ${baseFont}`;
        const testWidth = ctx.measureText(testString).width;

      
        if (testWidth !== baselines[baseFont]) {
          detected = true;
          break;
        }
      }

      if (detected) {
        detectedFonts.push(font);
      }
    });

    return {
      fonts: detectedFonts,
      count: detectedFonts.length,
      rawValue: detectedFonts.join(","),
    };
  } catch (error) {
    return {
      fonts: [],
      count: 0,
      rawValue: "fonts-blocked",
    };
  }
}