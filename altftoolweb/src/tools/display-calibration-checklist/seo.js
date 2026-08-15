const seo = {
  title: "Display Calibration Checklist: sRGB, Rec. 709, HDR",
  metaDescription:
    "Pick a workflow — web sRGB, print proofing, Rec. 709 or HDR PQ — get white point, gamma, luminance and room-light targets, plus the next due date.",
  steps: [
    "Choose the workflow under \"What is this display for?\" — from \"Web, UI and photo for screen (sRGB)\" to \"HDR grading (PQ / BT.2100)\" — and enter room lux, screen hours per day and the last-calibrated date.",
    "Untick \"I have a colorimeter\" if you lack a device, then tick off the phase-grouped steps, clearing every one tagged \"Critical\".",
    "Read the targets — white point, tone curve, white luminance in cd/m², room-light range and the \"Next calibration due\" date — and click \"Copy checklist\".",
  ],
  intro:
    "This checklist turns a choice of workflow — web and sRGB, print soft proofing, Rec. 709 video or HDR PQ — into the white point, tone curve, white luminance and room-light targets that the governing standard specifies, then orders the setup steps so nothing has to be measured twice. It also warns when your measured ambient light is outside the range the workflow assumes and dates the next calibration from panel hours or the 30-day calendar cap, whichever comes first.",
  useCases: [
    "Set up a second monitor for photo editing and get the sRGB white point, gamma and luminance right the first time.",
    "Prepare a soft-proofing station so on-screen colour matches a print viewed under a D50 booth.",
    "Configure a grading monitor to BT.1886 gamma 2.4 with the correct dim surround before a colour session.",
    "Work out when a display is next due for calibration based on how many hours a day it is actually on.",
  ],
  benefits: [
    ["Targets tied to standards", "Every number is attributed to the specification it comes from, not to habit."],
    ["Ordered, not just listed", "Room, hardware, software and verification run in the order that stops rework."],
    ["Honest without a device", "Choose 'no colorimeter' and the checklist swaps in a visual method and says what it cannot deliver."],
  ],
  faqs: [
    [
      "What brightness should I calibrate my monitor to?",
      "For screen work, 80 to 120 cd/m² is the usual range — sRGB is defined against 80 cd/m² with a 64 lux ambient in IEC 61966-2-1. SDR video grading targets 100 cd/m² in a dim room, and soft proofing typically runs 100 to 160 cd/m² so the screen matches a D50 print viewer.",
    ],
    [
      "Should I use D65 or D50 white point?",
      "Use D65 for anything delivered to screens, including web, UI, photography and video. Use D50 only for print and soft proofing, where the screen is being matched to prints viewed under an ISO 3664 D50 light.",
    ],
    [
      "How often should I recalibrate my monitor?",
      "Roughly every 200 hours of panel use, and no longer than a month between runs — at eight hours a day that works out to about every 25 days. Recalibrate immediately after moving the display, changing the room lighting or updating the graphics driver.",
    ],
    [
      "Can I calibrate a monitor without a colorimeter?",
      "You can get closer than factory defaults by selecting the sRGB or D65 OSD preset, matching screen brightness to white paper under your room light, and checking gamma and clipping with a test pattern. It is a visual match, not a measurement, so do not sign off colour-critical work on it.",
    ],
  ],
};

export default seo;
