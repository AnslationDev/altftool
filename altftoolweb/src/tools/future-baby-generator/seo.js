const seo = {
  title: "Future Baby Generator: Eye and Hair Odds",
  metaDescription:
    "Enter both parents' names, eye colour and hair type; optional photos are analysed in your browser. Output is a text trait report, not a baby picture.",
  steps: [
    "Enter Father's Name and Mother's Name, pick each parent's eye colour and hair type, and optionally add two images under 10 MB each.",
    "Press Generate Future Baby Profile — face detection and 68-point landmarking run in your browser and seed the report, so identical inputs repeat identically.",
    "Read the eye and hair percentage tables plus the name, personality and hobby suggestions, then Copy Report or Download future-baby-report.txt.",
  ],
  intro:
    "Future Baby Generator takes both parents' names, eye colour and hair type — plus optional photos — and returns a simplified Punnett-square style probability table for the baby's eye colour and hair, along with name, personality and hobby suggestions. If you upload two photos, face detection and 68-point facial landmarking run entirely inside your browser and the landmark coordinates seed the result, so the same pair of faces always produces the same report. It does not draw a baby picture: the output is a text report of trait percentages you can copy or download.",
  useCases: [
    "A couple announcing a pregnancy wants a light-hearted card insert showing the odds of brown versus blue eyes given their own eye colours.",
    "Two people at a baby shower settle a running argument about whose curly hair the child is likely to inherit by entering both parents' hair types.",
    "Someone stuck on a shortlist wants a nudge on names and gets two boy and two girl suggestions tied to the same seed each time they run it.",
  ],
  benefits: [
    ["Photos are analysed on your device", "Face detection and landmark extraction run in the browser, so the images you upload are never transmitted anywhere."],
    ["Repeatable, not random", "The seed comes from the facial landmarks (or a hash of the two names when no photos are used), so re-running the same inputs gives the same report."],
    ["A report you can keep", "Every prediction can be copied or downloaded as a plain-text file listing eye and hair percentages, names, personality and hobby."],
  ],
  faqs: [
    [
      "What do the eye colour percentages actually mean?",
      "They come from a fixed lookup keyed to the two parents' eye colours — for example two brown-eyed parents return 75% brown, 18% green and 7% blue, while two blue-eyed parents return 99% blue. Real eye colour is polygenic and these simplified tables are for entertainment, not genetic prediction.",
    ],
    [
      "Do I have to upload photos?",
      "No. Names, eye colours and hair types for both parents are the only required fields; photos are optional and simply change how the report is seeded. Each image must be under 10 MB.",
    ],
    [
      "Are my photos uploaded to a server?",
      "No. The face detector and the 68-point landmark model load into your browser and process the images locally, so nothing leaves your device and nothing is stored after you close the page.",
    ],
    [
      "Can this tell me what my baby will really look like?",
      "No — treat it as a novelty. The hair and eye tables are coarse approximations of dominant/recessive inheritance, and the personality and hobby lines are picked from four and six fixed options respectively; for anything involving real inherited conditions, speak to a doctor or a genetic counsellor.",
    ],
  ],
};

export default seo;
