const seo = {
  intro:
    "This tool stacks two images in the same frame and wipes between them with a draggable vertical divider, so a retouch, a colour variant or a quality change shows up as a single continuous edit rather than two pictures you have to look at in turn. Image B is clipped by a CSS inset from the divider position and Image A shows through behind it, with the frame locked to Image A's aspect ratio. It is for anyone presenting a before-and-after where side-by-side thumbnails hide the difference.",
  useCases: [
    "A seller comparing the raw product photo against the retouched listing image to check the edit did not change the actual colour of the item.",
    "Showing a client the shot before and after background removal, dragging the divider across the edges where the cut-out either works or does not.",
    "Deciding between two colourways of the same product shot when both look fine alone but only one matches the rest of the range.",
  ],
  benefits: [
    ["Difference lands on one spot", "Both images occupy the same pixels, so a change in shade or a moved edge appears where your eye already is instead of across two frames."],
    ["Jump to either extreme instantly", "Show A, 50/50 and Show B buttons snap the divider to 0%, 50% and 100% when you want the full frame rather than a wipe."],
    ["Works with touch as well as mouse", "The divider follows a finger drag on a phone, so you can review a comparison on the device you shot the photos with."],
  ],
  faqs: [
    [
      "Do the two images need to be the same size?",
      "They should be. The frame takes its aspect ratio from Image A and both images are fitted inside it, so a mismatched Image B will letterbox and the wipe will not line up. Crop both to identical dimensions before loading for a clean comparison.",
    ],
    [
      "Which side is which?",
      "Image B is revealed to the left of the divider and Image A stays on the right, and both are labelled in the top corners of the frame. Dragging the divider all the way right shows Image B in full; all the way left shows Image A.",
    ],
    [
      "Can I export or share the comparison?",
      "No — there is no export. This is a viewer for inspecting the pair on screen, so take a screenshot or a screen recording if you need to send the comparison to someone else.",
    ],
    [
      "Are my product photos uploaded?",
      "No. Both files are read into an in-browser object URL and rendered locally, so unreleased product shots and client work never leave the tab.",
    ],
  ],
};

export default seo;
