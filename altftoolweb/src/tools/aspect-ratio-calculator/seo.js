const seo = {
  title: "Aspect Ratio Calculator — Simplify Any Ratio",
  h1: "Aspect Ratio Calculator",
  metaDescription:
    "Simplify any width-to-height ratio and calculate proportional dimensions for thumbnails, banners, and responsive layouts — free, instant.",
  intro:
    "The Aspect Ratio Calculator simplifies any width-to-height pair to its lowest terms using the Euclidean GCD algorithm (for example, 1920×1080 simplifies to 16:9), and calculates the matching height or width for a new target size so your image or layout keeps the same proportions.",
  useCases: [
    "Finding the simplified ratio (16:9, 4:3, 1:1…) of a video, photo, or screen resolution",
    "Calculating the correct height for a banner, thumbnail, or responsive image at a new target width",
    "Checking that a design mockup or video export matches a required aspect ratio before publishing",
  ],
  benefits: [
    [
      "Exact simplification",
      "Uses the Euclidean GCD algorithm to reduce any width/height pair to its simplest ratio, not just a rounded approximation.",
    ],
    [
      "Solve for the missing dimension",
      "Enter a target width (or height) and get the exact proportional match, so nothing gets stretched or cropped.",
    ],
    [
      "Works for any use case",
      "Video resolutions, print sizes, banner ads, thumbnails — any width-and-height pair works the same way.",
    ],
    [
      "Free, instant, no signup",
      "Type your numbers and get the result immediately.",
    ],
  ],
  faqs: [
    [
      "How do I calculate an aspect ratio?",
      "Enter the width and height, and the calculator divides both by their greatest common divisor (GCD) to reduce them to the simplest ratio — for example, 1920×1080 reduces to 16:9.",
    ],
    [
      "What is 1920x1080 as a ratio?",
      "16:9. Dividing both numbers by their GCD (120) gives 16:9, the standard widescreen ratio used by most modern video and displays.",
    ],
    [
      "How do I find the height for a new width while keeping the same ratio?",
      "Enter your original width and height to get the simplified ratio, then enter your target width — the calculator returns the exact proportional height so the image or layout isn't stretched or distorted.",
    ],
    [
      "Is the Aspect Ratio Calculator free?",
      "Yes, completely free with no signup.",
    ],
  ],
  steps: [
    "Enter your original width and height.",
    "See the simplified ratio (like 16:9 or 4:3) instantly.",
    "Enter a target width or height to get the exact proportional match.",
  ],
};

export default seo;
