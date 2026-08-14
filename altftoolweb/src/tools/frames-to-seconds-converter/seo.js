const seo = {
  title: "Frames to Seconds Converter with SMPTE Timecode",
  metaDescription:
    "Convert frames, seconds and SMPTE timecode at exact rates — 23.976, 29.97 and 59.94 included — with drop-frame and non-drop labels side by side.",
  steps: [
    "Choose From Frames, From Seconds or From Timecode, then enter the Frame count, the Duration (seconds) or a Timecode (HH:MM:SS:FF).",
    "Pick the Frame rate — 23.976 through 120 fps, with the exact NTSC ratios used in the maths — and tick Drop-frame timecode, available only at 29.97 and 59.94 fps.",
    "Read the frames, real-time duration, timecode and its drop-frame or non-drop equivalent, plus how long one frame lasts, then press Copy result.",
  ],
  intro:
    "This converter turns a frame count into elapsed seconds and SMPTE ST 12-1 timecode by dividing frames by the exact frame rate, and reverses the calculation from a duration or a timecode string. It keeps the exact NTSC rates (24000/1001, 30000/1001, 60000/1001) separate from the integer rates that timecode labels count in, which is the source of most timing mistakes. Editors, animators and post supervisors use it to line up cut lengths, animation counts and delivery durations.",
  useCases: [
    "Turning an animator's 312-frame shot at 24 fps into the 13-second slot it occupies on the timeline",
    "Checking that a 30-second commercial is exactly 720 frames at 24 fps or 750 at 25 fps before delivery",
    "Converting a broadcast drop-frame in-point such as 01:00:30;12 into an absolute frame number for a conform",
  ],
  benefits: [
    ["Exact NTSC rates", "Uses 30000/1001 rather than 29.97 so long durations do not drift"],
    ["Drop-frame aware", "Shows the drop-frame and non-drop label for the same frame count side by side"],
    ["Works both ways", "Start from frames, seconds or timecode and get the other two instantly"],
  ],
  faqs: [
    [
      "How many frames are in one second?",
      "It equals the frame rate: 24 frames at 24 fps, 25 at 25 fps and 30 at 30 fps. At the NTSC rates one second holds 23.976, 29.97 or 59.94 frames, so a whole second never lands on a whole frame boundary.",
    ],
    [
      "How do I convert frames to seconds?",
      "Divide the frame count by the exact frame rate: 240 frames at 24 fps is 10 seconds, and 1,000 frames at 23.976 fps is 41.708 seconds. Use the exact rate rather than the rounded one when the clip runs longer than a few minutes.",
    ],
    [
      "What is drop-frame timecode and does it lose frames?",
      "Drop-frame skips two timecode labels at the start of every minute except every tenth minute, so no pictures are lost — only labels. One hour of 29.97 drop-frame timecode is 107,892 frames, while non-drop counting reaches 108,000 and runs about 3.6 seconds ahead of the clock.",
    ],
    [
      "Why is a 29.97 fps hour not exactly 3,600 seconds?",
      "Drop-frame counting corrects the error to about 3.6 milliseconds an hour, not to zero, because 29.97 is really 30000/1001. Non-drop timecode is left with the full 3.6-second discrepancy over an hour, which matters for broadcast durations but not for a short edit.",
    ],
  ],
};

export default seo;
