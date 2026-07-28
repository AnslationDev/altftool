const seo = {
  intro:
    "Video Tools is a browser-side video spec calculator: drop in a clip (or type its numbers) and it returns bitrate, aspect ratio, megapixels, frame count, SMPTE timecode, letterbox bars and the exact video bitrate needed to hit a target file size. Every figure comes from the definitions themselves — bitrate = file size in bits / duration in seconds, bits per pixel = bitrate / (width x height x fps) — and the quality check compares your bitrate against YouTube's published H.264 upload recommendation for that resolution. It is built for editors, social media managers and developers who need to size an export before they run it.",
  useCases: [
    "Compressing a 12-minute talk to fit a 25 MB email or upload limit, and needing the exact kbit/s to give ffmpeg or Handbrake.",
    "Checking whether a 1080p export at 4 Mbit/s is under-bitrated before uploading it to YouTube.",
    "Working out how tall a 9:16 canvas has to be to letterbox a 1920x1080 clip without cropping it for Reels or Shorts.",
  ],
  benefits: [
    ["Reads the real file", "Duration, width, height and byte size come from the video itself in your browser — the file is never uploaded."],
    ["Target-size maths, reversed", "Enter the megabytes you are allowed and it returns the video bitrate that lands on them after audio is subtracted."],
    ["Frame-accurate", "Total frames and HH:MM:SS:FF timecode at your project frame rate, so edit lengths line up with the timeline."],
  ],
  faqs: [
    [
      "How do I calculate video bitrate from file size and duration?",
      "Bitrate = file size in bits divided by duration in seconds. A 50 MB clip running 60 seconds is 50,000,000 x 8 / 60 = 6,666,667 bit/s, or 6.67 Mbit/s. This tool uses 1 MB = 1,000,000 bytes, the same decimal convention ffmpeg and platform upload limits use.",
    ],
    [
      "What bitrate should I upload 1080p video at?",
      "YouTube's recommended H.264 upload bitrate is 8 Mbit/s for 1080p at 24-30 fps and 12 Mbit/s at 48-60 fps. For 4K it is 35 and 53 Mbit/s, for 720p it is 5 and 7.5 Mbit/s. The tool flags your clip against the nearest tier.",
    ],
    [
      "What bitrate do I need to fit a video under 25 MB?",
      "Total bitrate = 25,000,000 x 8 / duration in seconds / 1000 kbit/s, then subtract the audio bitrate. For a 120-second clip with 128 kbit/s audio that is 1,667 total minus 128, so about 1,539 kbit/s of video.",
    ],
    [
      "What is bits per pixel and what number is good?",
      "Bits per pixel is bitrate divided by (width x height x fps) — it measures how much data each pixel of each frame gets. A 1080p30 clip at 6.7 Mbit/s works out to 0.107 bits per pixel. H.264 typically looks clean from about 0.1 upward for normal content; fast motion and grain need more.",
    ],
  ],
};

export default seo;
