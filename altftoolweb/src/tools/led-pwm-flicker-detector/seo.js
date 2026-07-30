const seo = {
  intro:
    "The LED PWM Flicker Detector opens your device's rear camera as a live preview so you can look for the rolling-shutter banding that appears when a lamp is switching on and off faster than the eye can follow, and it logs the RGB value of the centre pixel each time you press Sample centre frame. Point the reticle at a bulb, screen or headlight, sample repeatedly, and a light that holds steady returns near-identical values while a heavily modulated one produces readings that swing between bright and dark. The last 200 samples are kept in a timestamped table. This is an approximate visual check on your own hardware, not a calibrated flicker meter.",
  useCases: [
    "You bought LED bulbs for a room where someone gets headaches under certain lighting and want to compare two bulbs side by side before deciding which one to keep.",
    "A dimmer makes a fixture look fine at full brightness but strange when dimmed, and you want to see whether the banding on camera gets worse as you turn the dial down.",
    "You are choosing between two monitors or phone screens and want to check whether either one shows dark bands through the camera at low brightness, which is where PWM backlight dimming usually shows up.",
  ],
  benefits: [
    ["The camera does the seeing", "A rolling-shutter sensor scans the frame line by line, so light that switches faster than the frame rate turns into visible bands that your eye cannot resolve directly."],
    ["Sampled values, not just impressions", "Each sample records the centre pixel's red, green and blue channel values with a timestamp, so you can compare two lamps by numbers rather than by memory."],
    ["Everything stays on the device", "The camera stream is rendered and sampled locally and the track is stopped when you press Stop — no frame is uploaded."],
  ],
  faqs: [
    [
      "Why do LED lights flicker in the first place?",
      "Two common reasons: PWM dimming, where the LED is switched fully on and off thousands of times a second and the ratio sets the brightness, and inadequate smoothing in the driver, which leaves the output following the mains waveform. Mains-driven ripple appears at twice the supply frequency — around 100 Hz on a 50 Hz supply and 120 Hz on a 60 Hz one.",
    ],
    [
      "Does this measure the flicker frequency in hertz?",
      "No. It shows you the live camera image so banding is visible, and logs centre-pixel RGB values for frames you sample — it does not compute a frequency, a percent-flicker figure or a flicker index. Reading a true frequency needs a photodiode and a scope or a dedicated flicker meter.",
    ],
    [
      "Why can I see bands on camera but not with my eyes?",
      "Because most phone cameras use a rolling shutter that exposes each row of the sensor at a slightly different moment. A lamp modulating at 100 Hz is far above the roughly 60 Hz at which most people stop perceiving flicker directly, but it is slow relative to the sensor's row-by-row readout, so it prints as stripes across the frame.",
    ],
    [
      "What do I do if a light turns out to flicker badly?",
      "Practical options are replacing the bulb with one specified as flicker-free or low-flicker, changing the driver or dimmer for a compatible model, or using the fixture at full brightness where PWM depth is usually lowest. If someone in the household reports headaches, eye strain or migraine that seems tied to particular lighting, treat that as a matter for a clinician rather than something this check can settle.",
    ],
  ],
};

export default seo;
