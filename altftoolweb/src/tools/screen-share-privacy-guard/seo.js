const seo = {
  title: "Screen Share Privacy Guard: Rehearse Before You",
  metaDescription:
    "Previews the screen, window or tab you would share via getDisplayMedia, lets you mark leaky areas, and runs a six-point check. Covers are preview-only.",
  steps: [
    "Press Start private preview and choose a screen, window or tab in your browser's own picker; the capture asks for video only and audio is never requested.",
    "Drag across the live preview to draw a solid cover, or add the Browser tabs, Notification corner and Taskbar or dock presets, then place them exactly with the Left, Top, Width and Height sliders.",
    "Work the Privacy checklist until it reads Manual checks complete, then hide or move every covered item in the source app — the covers are drawn in this preview only and never change what Zoom, Meet or Teams transmits.",
  ],
  intro:
    "This is a pre-flight rehearsal for screen sharing: it opens a private preview of a screen, window or tab through the browser's getDisplayMedia picker, lets you drag solid covers over anything that should not be visible, and walks you through a six-point privacy checklist before you share for real. The preview never leaves the tab, is not recorded, and no content analysis or OCR is performed on it. The covers are rehearsal marks that show you what to close or move — they do not alter the feed that Zoom, Meet or Teams sends.",
  useCases: [
    "You are about to demo to a client from your work laptop and want to see exactly what your second monitor shows before the meeting starts, not two minutes into it",
    "You share a specific window every week and want to check that the notification corner and the taskbar are outside the capture area for that window",
    "You are training someone on screen-share hygiene and want a checklist you can walk through together — notifications off, unrelated tabs closed, no credentials on screen — while looking at the actual surface",
  ],
  benefits: [
    ["You see the real capture, not a guess", "The preview uses the same picker your meeting app does, so what you inspect is the exact surface and dimensions that would be transmitted."],
    ["Preset covers for the usual leaks", "One click marks the browser tab strip across the top 12%, the notification corner in the top-right, or the taskbar and dock along the bottom 10%."],
    ["A checklist that names specific risks", "Six items cover notifications, stray tabs, identity details, passwords and API keys, payment and government identifiers, and desktop clutter — each with what to look at."],
  ],
  faqs: [
    [
      "Do the covers actually hide anything from the people in my call?",
      "No — and this is the most important thing to understand about the tool. Covers are drawn only in this preview so you can spot what needs closing or moving; your meeting app shares the unmodified surface. To genuinely hide something, close it, move it off the shared window, or share a single application window rather than the whole screen.",
    ],
    [
      "Is my screen sent anywhere or recorded?",
      "No. The stream stays inside this browser tab as a live preview, nothing is written to disk or uploaded, and audio is never requested — the capture asks for video only. There is no OCR, no screenshotting and no automated content analysis of what is on your screen.",
    ],
    [
      "What is the safest thing to share in a meeting?",
      "A single application window, not the entire screen. Sharing one window means notifications, the taskbar, other apps and anything you switch to stay outside the capture entirely, which removes the whole class of accidents that happen when you alt-tab mid-call.",
    ],
    [
      "Why does the preview stop on its own?",
      "Because the browser ended the capture — usually you clicked its own 'stop sharing' bar, or the window you selected was closed. Start a new preview to pick another surface; each new preview clears the covers and checklist so you review the new surface from scratch.",
    ],
  ],
};

export default seo;
