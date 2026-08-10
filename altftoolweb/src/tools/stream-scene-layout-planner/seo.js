const seo = {
  title: "Stream Scene Layout Planner — OBS Transform Coordinates",
  metaDescription:
    "Place gameplay, facecam and chat on a 1080p, 1440p or vertical canvas and get integer Position X/Y and Size W/H values for the OBS Edit Transform dialog.",
  steps: [
    "Pick your 'Stream canvas' — 1920 × 1080, 2560 × 1440, 1280 × 720 or 1080 × 1920 vertical — and the 'Capture aspect ratio', from 16:9 down to 4:3 retro / emulator.",
    "Set 'Facecam width (% of canvas)' with its corner and inset, the 'Chat width (% of canvas)' and side, and the 'Outer margin (% per side)', which defaults to the 3.5% action-safe inset.",
    "Read each source's integer 'Position X, Y' and 'Size W × H' from the table, note the reported letterbox or pillarbox bars, and press 'Copy transforms' to paste into OBS.",
  ],
  intro:
    "The Stream Scene Layout Planner works out exactly where the gameplay capture, facecam and chat panel sit on a stream canvas and gives you the pixel Position X/Y and Size W/H to type into the OBS Edit Transform dialog. The capture is aspect-fitted with the standard scale = min(boxWidth / aspectWidth, boxHeight / aspectHeight), so any letterbox or pillarbox bars are measured and reported rather than quietly cropped, and the default margin is the SMPTE RP 218 action-safe inset of 3.5% per side.",
  useCases: [
    "Lay out a 1080p gaming scene with chat on the right and work out how much of the game the facecam is actually hiding.",
    "Check what a 4:3 emulator capture does to a 16:9 canvas before you build the scene and discover the pillarbox bars live.",
    "Rebuild a 1920 × 1080 layout for a 1080 × 1920 vertical stream without guessing the new coordinates.",
    "Give a co-streamer or editor an exact source list so both of your scenes match frame for frame.",
  ],
  benefits: [
    ["Numbers you can paste", "Every source comes out as integer Position and Size values in OBS's own units."],
    ["Bars are measured", "Letterbox and pillarbox amounts are calculated from the aspect fit, not eyeballed in the preview."],
    ["Catches the usual mistakes", "Warns when the facecam covers too much of the game, when chat is too narrow to read, and when a source crosses title-safe."],
  ],
  faqs: [
    [
      "What size should a facecam be on a 1080p stream?",
      "A facecam between about 18% and 25% of canvas width — roughly 350 to 480 px on a 1920 px canvas — is the usual range, which works out to under 10% of the gameplay area. Past about 15% coverage the camera starts hiding parts of the game that viewers need to see.",
    ],
    [
      "How wide should the chat panel be in an OBS scene?",
      "Around 300 to 400 px on a 1080p canvas, or roughly 16% to 20% of the width. Twitch's popout chat has a 340 px minimum window width, and below about 300 px messages wrap every few words and become tiring to read on a phone.",
    ],
    [
      "Why does my capture have black bars in OBS?",
      "Because the source's aspect ratio does not match the box you are fitting it into. A 16:9 capture in a taller box gets letterbox bars top and bottom; a 4:3 capture in a 16:9 box gets pillarbox bars left and right. Either crop the source, change the canvas, or fill the bars with a background layer.",
    ],
    [
      "What is the safe area for a stream overlay?",
      "SMPTE RP 218 puts the action-safe area at the central 93% of the picture and the title-safe area at the central 90% — on a 1920 × 1080 canvas that is a 1728 × 972 box inset 96 px each side. Keeping alerts, names and labels inside title-safe stops them being clipped by overscan or covered by the platform's own on-screen controls.",
    ],
  ],
};

export default seo;
