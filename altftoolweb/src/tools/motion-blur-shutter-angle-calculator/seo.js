const seo = {
  intro:
    "Motion Blur Shutter Angle Calculator converts between shutter angle and shutter speed using shutter seconds = angle ÷ (360 × fps), so 180° at 24 fps is 1/48 second and 180° at 60 fps is 1/120. It reports the exposure as a share of the frame, the difference from the 180-degree rule in photographic stops, the nearest setting on a camera dial, and the angles that expose for a whole number of mains cycles — 172.8° at 24 fps under 50 Hz, 144° under 60 Hz — so artificial lighting does not band.",
  useCases: [
    "Set the right shutter speed after switching a camera from 24 fps to 60 fps for a slow-motion insert.",
    "Find the flicker-free shutter angle before shooting under fluorescent or LED lighting in a 50 Hz country.",
    "Work out how many stops of light a 90-degree action-sequence shutter costs you.",
    "Match the exposure time across a speed ramp so brightness does not shift mid-shot.",
  ],
  benefits: [
    ["Works both directions", "Enter an angle or a shutter speed and get the other, checked against the frame interval."],
    ["Flicker table included", "Lists every whole-mains-cycle angle that fits inside one frame at your rate and supply frequency."],
    ["Exposure in stops", "Shows the light cost of moving away from 180° so you can compensate with aperture or ISO."],
  ],
  faqs: [
    [
      "What is the 180-degree shutter rule?",
      "Set the shutter angle to 180°, which exposes each frame for exactly half the frame interval and produces the amount of motion blur most viewers read as natural. In shutter-speed terms it is 1 over twice the frame rate: 1/48 s at 24 fps, 1/50 s at 25 fps, 1/60 s at 30 fps and 1/120 s at 60 fps.",
    ],
    [
      "How do I convert shutter angle to shutter speed?",
      "Shutter speed in seconds equals the angle divided by 360 times the frame rate. At 24 fps a 180° shutter is 180 ÷ (360 × 24) = 1/48 second, a 90° shutter is 1/96 second, and a 360° shutter is a full 1/24 second. Halving the angle halves the exposure, costing exactly one stop of light.",
    ],
    [
      "What shutter angle stops flicker under LED or fluorescent lights?",
      "Pick an angle whose exposure covers a whole number of mains cycles. Under 50 Hz mains at 24 fps that is 172.8° (1/50 s); under 60 Hz mains at 24 fps it is 144° (1/60 s). At 25 fps under 50 Hz the standard 180° already works out to exactly 1/50 s, which is why PAL frame rates rarely band in Europe and India.",
    ],
    [
      "Why does a low shutter angle make panning look stuttery?",
      "A narrow angle freezes each frame with very little blur, so consecutive frames show the subject in distinctly separate positions rather than overlapping smears. The eye reads that as stepping rather than movement. Below roughly 90° the effect is strong enough to be a stylistic choice rather than a neutral one.",
    ],
  ],
};

export default seo;
