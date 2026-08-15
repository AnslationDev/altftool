const seo = {
  title: "Depth of Field Estimator with Hyperfocal & Diffraction",
  metaDescription:
    "Near limit, far limit and hyperfocal from H = f²/(N×c) + f, with a real circle of confusion per sensor and a warning when diffraction outruns it.",
  steps: [
    "On the Calculator tab, pick Camera Sensor Size — each format carries its own circle of confusion, from 0.030 mm for full frame down to 0.005 mm for a phone sensor.",
    "Set Focal Length, Aperture (f-stop) and Subject Focus Distance with the sliders or number fields, switching the M and FT buttons for your units.",
    "Read Total Depth of Field with Near Limit of Sharpness, Far Limit of Sharpness and the Hyperfocal figure on the diagram, plus the diffraction warning.",
  ],
  intro:
    "The Depth of Field Estimator works out the near limit, far limit and hyperfocal distance for a given sensor, focal length, aperture and subject distance using the standard circle-of-confusion formulas — hyperfocal H = f² / (N × c) + f, with the near and far limits derived from H. It covers eight formats from medium format through full frame, APS-C and Micro Four Thirds down to a 6.0x smartphone sensor, each with its own circle-of-confusion value, and it warns when diffraction starts to outrun that value. It is for photographers who want to know before the shot how much will actually be sharp.",
  useCases: [
    "You are shooting a group portrait at f/2.8 and need to know whether the person standing half a metre behind the front row will still be inside the sharp zone.",
    "Setting up a landscape frame, you want the hyperfocal distance for your 24mm at f/11 so you can focus once and keep everything from mid-foreground to infinity acceptably sharp.",
    "You are tempted to stop down to f/22 for a product shot and want to check whether diffraction will soften the whole frame before it buys you the extra depth.",
  ],
  benefits: [
    ["Correct circle of confusion per format", "Uses a real CoC for each sensor — 0.030 mm full frame, 0.020 mm APS-C, 0.015 mm Micro Four Thirds, 0.005 mm phone — instead of one number for every camera."],
    ["Front and rear split, not just total", "Reports how much of the sharp zone sits in front of the subject and how much behind, and flags when the far limit reaches infinity."],
    ["Diffraction warning built in", "Computes the Airy disk at 2.44 × 550 nm × f-number and tells you when it exceeds the sensor's CoC limit, which is the point extra stopping down starts costing sharpness."],
  ],
  faqs: [
    [
      "How is hyperfocal distance calculated?",
      "H = f² / (N × c) + f, where f is focal length in millimetres, N is the f-number and c is the sensor's circle of confusion. Focus at H and everything from roughly H/2 to infinity falls inside the acceptable-sharpness range.",
    ],
    [
      "What circle of confusion should I use for my sensor?",
      "The tool uses 0.030 mm for full frame, 0.020 mm for 1.5x APS-C, 0.019 mm for Canon's 1.6x APS-C, 0.015 mm for Micro Four Thirds, 0.011 mm for 1-inch and 0.005 mm for a typical smartphone sensor, with 0.038 mm and 0.045 mm for the two medium-format options. Smaller sensors need a smaller CoC because the image is enlarged more to reach the same print size.",
    ],
    [
      "At what aperture does diffraction start to soften my images?",
      "When the Airy disk grows larger than the sensor's circle of confusion — the Airy diameter in micrometres is about 1.342 × the f-number for green light at 550 nm. On full frame that crosses 30 µm around f/22, but on Micro Four Thirds the 15 µm limit is reached near f/11, which is why smaller sensors hit diffraction sooner.",
    ],
    [
      "Why is the depth of field not centred on my subject?",
      "Because the near and far limits are not symmetrical: at ordinary distances more of the sharp zone sits behind the focus point than in front, and the split shifts toward the front as you approach the hyperfocal distance. The tool shows the front and rear distances separately so you can place focus deliberately rather than assuming a one-third rule.",
    ],
  ],
};

export default seo;
