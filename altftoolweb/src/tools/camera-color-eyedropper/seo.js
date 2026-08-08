const seo = {
  title: "Camera Color Eyedropper: RGB from the Centre Pixel",
  metaDescription:
    "Point the rear camera, press Sample centre frame, and it reads the single pixel under the reticle — logging R, G, B and a timestamped rgb() string.",
  steps: [
    "Press \"Start with permission\" and allow camera access — the tool asks for the rear-facing camera and opens a live preview under \"Live local readings\" with a circular reticle at the centre of the frame.",
    "Aim the reticle at the wall, swatch or printed sheet and press \"Sample centre frame\"; that frame is drawn to a local canvas and the single pixel at the exact centre is read.",
    "Each sample appends a timestamped row of the red, green and blue values plus the rgb() string to the readings table, so several surfaces can be compared from one session; \"Stop sensor\" ends the stream and stops the camera track.",
  ],
  intro:
    "This eyedropper turns your phone's rear camera into a colour sampler: it opens a live video preview with a circular reticle at the centre of the frame, and each time you press \"Sample centre frame\" it draws that frame to a canvas and reads the single pixel at the exact centre, logging its red, green and blue values as an rgb() string with a timestamp. Point it at a wall, a fabric swatch or a printed sheet and you get a numeric approximation of what the camera saw. Because it reads one raw pixel through the camera's own auto-exposure and white balance, treat the result as an approximate reference, not a colorimeter reading.",
  useCases: [
    "You are matching paint or wall colour and want a rough RGB starting point to compare against swatches, rather than eyeballing it under shop lighting",
    "A client's printed brochure has a brand colour with no spec sheet, and you need a numeric approximation to begin a digital match",
    "You are sampling several fabric or tile options in the same room and want a timestamped list of readings taken under identical lighting to compare",
  ],
  benefits: [
    ["A visible reticle for exactly what is sampled", "The circle marks the centre pixel the tool will read, so you know what you are aiming at instead of hoping the sample landed on the right area."],
    ["Every reading is kept and timestamped", "Samples accumulate into a table with the time and RGB values, so you can compare several surfaces from one session instead of noting numbers by hand."],
    ["Camera stream never leaves the device", "The video is drawn into a local canvas and only that one pixel is read; nothing is uploaded, and the stream stops when you press stop or leave the page."],
  ],
  faqs: [
    [
      "How accurate is a phone camera as a colour picker?",
      "Approximate at best. The tool reads the raw pixel the camera produces after its own automatic white balance, exposure and tone curve, so the same surface can return noticeably different RGB values under daylight versus a warm bulb. For colour-critical work use a calibrated colorimeter or spectrophotometer.",
    ],
    [
      "Does it average a region or read a single pixel?",
      "A single pixel — the one at the exact centre of the captured frame, marked by the on-screen circle. That makes it precise about location but sensitive to sensor noise, so take three or four samples of the same spot and compare them rather than trusting one reading.",
    ],
    [
      "Why does the camera not start?",
      "Camera access requires a secure context (HTTPS) and an explicit permission grant, and the tool asks for the rear-facing camera specifically. If permission was previously denied for the site, the browser will not prompt again until you reset it in site settings; on a desktop without a rear camera the request may fail outright.",
    ],
    [
      "How do I turn the RGB values into a hex code?",
      "Convert each of the three channel values, which range from 0 to 255, into two hexadecimal digits and concatenate them — rgb(20, 184, 166) becomes #14B8A6. The readings table gives you the decimal values and the rgb() string ready to paste into any converter or CSS.",
    ],
  ],
};

export default seo;
