const seo = {
  title: "Timelapse Interval Calculator: Frames, Clip, GB",
  metaDescription:
    "Enter shoot hours, interval and playback fps to get the shot count, finished clip length, storage in GB and whether your card is big enough.",
  steps: [
    "Fill in Shoot hours, Interval sec, Playback fps, MB/photo and Card GB.",
    "Change Interval sec or Playback fps to trade smoothness against frame count — at 24 fps, one second of clip needs 24 shots.",
    "Read Shots, Clip length, Storage in GB and whether Card reads fits or too small, then press Copy.",
  ],
  intro:
    "This calculator links the three numbers that define a timelapse — shooting interval, frame count and finished clip length — so fixing any two gives you the third. It uses the exact relationships frames = shooting time ÷ interval, clip length = frames ÷ playback frame rate, and time compression = interval × playback frame rate, which is why a 2 second interval at 24 fps always compresses time by 48× whatever the shoot length. It also sizes the card space the sequence needs and warns when an interval is too short for the exposure plus file write.",
  useCases: [
    "Planning a sunset sequence that has to run exactly 10 seconds in the edit",
    "Checking whether a 128 GB card will survive an overnight star-trail shoot at 25 second intervals",
    "Working out the interval for a construction timelapse that must compress three months into a minute",
  ],
  benefits: [
    ["Sizes the card first", "Shows total gigabytes, how many frames the card holds and how long that lasts on location."],
    ["Catches impossible setups", "Flags intervals shorter than the exposure plus write time, before the intervalometer skips frames."],
    ["Plain-English clip length", "Turns the raw shot count into hours, minutes and seconds instead of leaving you to convert it."],
  ],
  faqs: [
    [
      "What interval should I use for a timelapse?",
      "It depends entirely on how fast the subject moves: about 1 second for people and traffic, 2 seconds for fast clouds, 4 to 5 seconds for a sunset or slow shadows, 20 to 30 seconds for stars, and several minutes for construction or plant growth. Shorter intervals give smoother motion but far more frames and far more card space.",
    ],
    [
      "How long do I need to shoot for a 10 second timelapse?",
      "This calculator takes the interval as the starting point, so work backward manually: multiply the clip length by your frame rate to get the frame count, then multiply by the interval. Ten seconds at 24 fps needs 240 frames, so at a 5 second interval you shoot for 1,200 seconds — 20 minutes. At a 2 second interval the same clip only takes 8 minutes. Enter that shooting time and interval above to check the card space and confirm the plan.",
    ],
    [
      "How many photos are in one second of timelapse?",
      "Exactly the playback frame rate: 24 photos per second on a 24 fps timeline, 25 at 25 fps, 30 at 30 fps. This is why timelapse eats storage — one minute of 24 fps footage is 1,440 individual stills, which at 25 MB a RAW file is 36 GB.",
    ],
    [
      "Can my interval be shorter than my shutter speed?",
      "No. The camera needs the full exposure to finish plus roughly a second to write the file before the next cycle, so a 25 second star exposure needs an interval of about 26 seconds or more. Set it shorter and the intervalometer silently skips cycles, leaving gaps that show as jumps in the finished sequence.",
    ],
  ],
};

export default seo;
