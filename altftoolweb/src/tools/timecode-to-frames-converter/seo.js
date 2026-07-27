const seo = {
  intro:
    "This converter moves between SMPTE timecode, an absolute frame number and real elapsed seconds at any frame rate from 23.976 to 120 fps. It implements the SMPTE ST 12-1 drop-frame rule exactly: at 29.97 fps the frame labels :00 and :01 are skipped at the start of every minute except minutes divisible by ten, which removes 108 labels an hour and keeps timecode aligned with the wall clock. Non-drop timecode at 29.97 runs 3.6 seconds slow per hour, and the tool reports that drift alongside every conversion so you can see exactly where a session, an EDL or a delivery spec will disagree.",
  useCases: [
    "Converting a shot's in and out timecode into an absolute frame count for a VFX or conform spreadsheet",
    "Checking why a one-hour drop-frame programme measures 3,600 seconds while its non-drop equivalent measures 3,603.6",
    "Finding the exact frame number to cut on from a note written in seconds during a review session",
  ],
  benefits: [
    ["Drop frame done properly", "Rejects labels that do not exist and converts both directions with the canonical SMPTE algorithm."],
    ["Real time as well as timecode", "Uses the exact 1000/1001 rates, so 29.97 is 30000/1001 rather than a rounded decimal."],
    ["Shows the drift", "Every result reports how far non-drop timecode has wandered from the wall clock at that point."],
  ],
  faqs: [
    [
      "How do I convert timecode to frames?",
      "Multiply out the hours, minutes and seconds by the nominal frame rate and add the frame field: frames = (3600×h + 60×m + s) × fps + ff. At 25 fps, 00:01:00:00 is 1,500 frames. For drop-frame timecode you then subtract 2 frames for every minute that is not a multiple of ten.",
    ],
    [
      "What is the difference between drop frame and non-drop frame?",
      "Drop frame skips frame *labels*, not pictures, so that timecode keeps pace with real time at 29.97 fps. Non-drop counts every label in order and therefore falls behind the wall clock by 3.6 seconds every hour — over a one-hour programme that is 108 frames. Drop frame is written with a semicolon before the frames, as 01:00:00;00.",
    ],
    [
      "How many frames are in one hour of 29.97 fps video?",
      "107,892 frames of real picture, which is exactly what a drop-frame reading of 01:00:00;00 represents. A non-drop reading of 01:00:00:00 counts 108,000 frames, which takes 3,603.6 real seconds — one hour plus 3.6 seconds.",
    ],
    [
      "Does 23.976 fps use drop frame?",
      "No. Drop frame exists only for the 29.97 fps family — 29.97, 59.94 and 119.88 — where skipping 2, 4 or 8 labels a minute makes timecode match the clock. At 23.976 the arithmetic does not work out to a whole number of skipped labels, so the format is always non-drop and simply runs slow against real time.",
    ],
  ],
};

export default seo;
