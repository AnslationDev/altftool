const seo = {
  title: "Crop to Aspect Ratio Calculator with ffmpeg",
  metaDescription:
    "Get the largest crop that fits a target ratio — width, height and offsets snapped to even pixels for 4:2:0 video, plus a ready ffmpeg crop string.",
  steps: [
    "Enter 'Source width (px)' and 'Source height (px)' — or tap a preset like 3840 x 2160 — and set the target ratio parts or a chip such as 9:16 vertical or 2.39:1 scope.",
    "Choose 'Crop position' (Centre, Top / left, Bottom / right) and keep 'Snap to even pixels (4:2:0 video)' ticked for encoder-safe values.",
    "Read the Crop rectangle size and offsets, the pixels-kept percentage, and copy the ffmpeg -vf crop line with 'Copy result'.",
  ],
  intro:
    "This calculator returns the largest rectangle inside a source frame that already matches a target aspect ratio, so the picture is reframed by cutting rather than stretching. If the source is wider than the target it keeps full height and sets crop width to height times the target ratio; if it is taller it keeps full width and sets crop height to width divided by the ratio. It also snaps the rectangle to even pixels for 4:2:0 encoding and prints the matching ffmpeg crop filter.",
  useCases: [
    "Turning a 3840x2160 UHD master into a 9:16 vertical cut and knowing exactly how many pixels of the sides disappear",
    "Cropping a 6000x4000 stills frame to 2.39:1 for a title card without guessing the height",
    "Batch-processing a folder of clips to 1:1 with a copy-paste ffmpeg crop string and even-numbered offsets",
  ],
  benefits: [
    ["Exact and rounded values", "Shows the true crop size and the even-pixel version encoders accept"],
    ["Anchor control", "Centre, top/left or bottom/right crops with the matching x and y offsets"],
    ["Loss at a glance", "Percentage of pixels kept tells you when a crop is too aggressive"],
  ],
  faqs: [
    [
      "How do I crop 16:9 footage to 9:16 without black bars?",
      // 606, not the raw 1080 x 9/16 = 607.5: the calculator's default "snap to even pixels"
      // setting rounds crop width down to an even number for 4:2:0 encoding. Keep this in
      // sync with lib.js's computeCrop({sourceWidth:1920, sourceHeight:1080, targetWidth:9, targetHeight:16, align:true}).
      "Keep the full 1080-pixel height and cut the width to 606 pixels, which is 1080 x 9/16 rounded down to the nearest even pixel, then centre it at x 656. That keeps only about 32% of the original pixels, so shoot or reframe with the vertical crop in mind where possible.",
    ],
    [
      "Why must the crop width and height be even numbers?",
      "H.264 and H.265 in 4:2:0 store one chroma sample for each 2x2 block of luma, so odd widths, heights or offsets cannot be split cleanly and encoders either error out or shift the image. Rounding down to an even value loses at most one pixel per side.",
    ],
    [
      "Does cropping reduce quality?",
      "Cropping itself is lossless because it only discards pixels, but the remaining area is smaller, so scaling it back up to the delivery resolution softens the picture. A 1:1 crop of UHD still leaves 2160x2160, which is more than enough for a 1080x1080 social post.",
    ],
    [
      "What is the ffmpeg command to crop to a ratio?",
      'Use the crop filter in the form ffmpeg -i input.mp4 -vf "crop=w:h:x:y" output.mp4, where w and h are the crop size and x and y the offset from the top-left corner. Add -c:a copy to leave the audio untouched.',
    ],
  ],
};

export default seo;
