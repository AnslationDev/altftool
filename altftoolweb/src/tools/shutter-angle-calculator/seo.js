const seo = {
  intro:
    "The Shutter Angle Calculator converts between the rotary shutter angle a cinema camera displays and the 1/x shutter speed a stills-derived menu asks for, at any frame rate. The relationship is exposure time = angle / (360 x fps), so the familiar 180-degree rule — exposing for half of each frame interval — gives 1/48 s at 24 fps and 1/50 s at 25 fps. It also checks the resulting exposure against 50 Hz and 60 Hz mains lighting, which pulses at twice the supply frequency and causes rolling bands when the exposure does not span a whole number of pulses.",
  useCases: [
    "Match a 180-degree look on a mirrorless camera that only offers shutter speeds in fractions of a second.",
    "Find the angle that keeps you flicker-free at 24 fps under 50 Hz lights — 172.8 degrees gives exactly 1/50 s.",
    "Work out the exposure change when you drop to 90 degrees for a crisp action sequence and need to open a stop.",
    "Set a high-frame-rate slow-motion shot without accidentally quadrupling the shutter speed.",
  ],
  benefits: [
    [
      "Both directions",
      "Enter an angle to get the speed, or a speed to get the angle your camera would call it.",
    ],
    [
      "Flicker check built in",
      "Flags exposures that will band under mains lighting and offers the nearest safe angle.",
    ],
    [
      "Exposure impact shown",
      "Reports how many stops each angle sits from the 180-degree reference so you can compensate.",
    ],
  ],
  faqs: [
    [
      "What shutter speed is a 180-degree shutter?",
      "It is half the frame interval, so the denominator is twice the frame rate: 1/48 s at 24 fps, 1/50 s at 25 fps, 1/60 s at 30 fps and 1/120 s at 60 fps. The formula is shutter speed denominator = 360 / angle x fps.",
    ],
    [
      "Why do people use 172.8 degrees?",
      "Because 360 / 172.8 x 24 = exactly 50, so a 172.8-degree shutter at 24 fps gives a 1/50 s exposure, which is flicker-free under 50 Hz mains lighting. It is only 0.06 of a stop darker than 180 degrees, so the motion blur is visually identical.",
    ],
    [
      "How do I stop lights flickering on video?",
      "Choose an exposure time that spans a whole number of light pulses. Mains-powered discharge and non-DC LED lamps pulse at twice the supply frequency, so use 1/50 or 1/100 s on a 50 Hz supply and 1/60 or 1/120 s on 60 Hz. Dimmed or PWM-driven LEDs flicker at their own rate, so always confirm on a monitor.",
    ],
    [
      "Does changing shutter angle change my exposure?",
      "Yes — halving the angle halves the light, which is one stop. Going from 180 to 90 degrees costs a stop, and 180 to 45 degrees costs two, so you need to open the iris, raise ISO or add light to keep the same brightness while getting crisper motion.",
    ],
  ],
};

export default seo;
