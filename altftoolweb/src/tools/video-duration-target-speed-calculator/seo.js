const seo = {
  title: "Video Speed Calculator: Fit a Clip to a Target Runtime",
  metaDescription:
    "Divide current length by target runtime to get the exact speed multiplier. Accepts seconds, m:ss or h:mm:ss and shows the trim needed to stay under 1.5x.",
  steps: [
    "Enter \"Current length\" and \"Target runtime\" as seconds, m:ss or h:mm:ss; optionally put removed material in \"Cutting first (optional)\".",
    "Add the \"Timeline frame rate (fps)\" and an optional \"Script word count\" to get output frames and the delivery rate in words per minute.",
    "Read the \"Speed needed\" multiplier with its verdict, the cut-instead times for 1.25x and 1.5x, and the pitch shift in semitones; \"Copy result\" exports it.",
  ],
  intro:
    "To make a video fit a fixed runtime you divide: speed multiplier = current length ÷ target length. A 3 minute 12 second cut that has to land at 90 seconds needs 2.13×. This calculator does that arithmetic, accepts durations as seconds, m:ss or h:mm:ss, and lets you subtract material you are willing to cut before the speed change is applied. It also solves the problem in reverse — given a speed ceiling such as 1.25× or 1.5×, it tells you exactly how many seconds you would have to remove instead.",
  useCases: [
    "Fit a 3-minute edit into a 90-second Instagram Reel and see whether the required speed is survivable for the voiceover.",
    "Work out how much to cut from a webinar recap so it lands at 60 seconds without going past 1.5× speed.",
    "Check the delivery rate in words per minute a script ends up at once the video is sped up to hit a 30-second ad slot.",
    "Confirm the exact frame count of the finished piece at 30 fps before exporting to a platform with a hard duration limit.",
  ],
  benefits: [
    ["Trim and speed together", "Subtracts the material you are cutting first, so the multiplier reflects the edit you are actually making."],
    ["Cut-instead figures", "Shows the seconds you would need to remove to stay under 1.25× and under 1.5×, the usual comfort thresholds for speech."],
    ["Flexible duration input", "Reads 90, 1:30 or 00:01:30 and rejects impossible values like 1:70 rather than silently misreading them."],
  ],
  faqs: [
    [
      "How do I calculate the speed needed to fit a video into a set time?",
      "Divide the current length by the target length. A 180-second video that has to be 60 seconds needs 180 ÷ 60 = 3.00×, or 300% speed. If you are also cutting material, subtract that first: (180 − 30) ÷ 60 = 2.50×.",
    ],
    [
      "How fast can you speed up a video before it becomes unwatchable?",
      "For spoken content, up to about 1.25× is usually unnoticeable, 1.25× to 1.5× is audibly quick but followable, and beyond 2× narration stops working as narration. Music and action tolerate far less. These are editing thresholds rather than measured limits, so judge it against your own material.",
    ],
    [
      "Does speeding up a video raise the pitch of the audio?",
      "Yes, unless you use a pitch-preserving time stretch. The shift is 12 × log₂(multiplier) semitones, so 2× speed raises the audio by a full octave, and 1.25× raises it by about 3.9 semitones — enough to sound distinctly odd on a voice.",
    ],
    [
      "Should I cut the video or speed it up?",
      "Cut first. Speeding up compresses everything equally, including the pauses that make speech intelligible, whereas cutting removes the parts that were not carrying the point. This tool shows the exact trim needed to keep the speed under 1.25× or 1.5× so you can compare the two approaches directly.",
    ],
  ],
};

export default seo;
