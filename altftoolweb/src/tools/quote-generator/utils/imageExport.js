"use client";

import html2canvas from "html2canvas";

export const downloadQuoteImage = async (elementRef, filename = "quote.png") => {
  if (!elementRef.current) return false;
  
  try {
    const canvas = await html2canvas(elementRef.current, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: null, // Keep transparent if needed, or it captures the inline styles
    });
    
    const dataUrl = canvas.toDataURL("image/png");
    
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Failed to generate image", error);
    return false;
  }
};
