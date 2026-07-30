const seo = {
  intro:
    "The Blood Pressure Classification Tool takes a systolic and diastolic reading in mmHg and names the category it falls into under either the ACC/AHA 2017 or the ESC/ESH 2018 guideline, which disagree about where hypertension begins. It is built for people tracking readings from a home cuff who want to know whether 132/78 counts as Elevated or High Normal, and it keeps your last 30 readings locally so you can see an average and a trend rather than one isolated number. Every reading also returns the guideline's own risk wording plus lifestyle notes, and it is informational only — diagnosis and treatment belong to a clinician.",
  useCases: [
    "Your home monitor reads 134/82 and your last clinic visit called you normal — switching between ACC/AHA and ESC/ESH shows you that the same reading is Stage 1 Hypertension under one guideline and only High Normal under the other.",
    "You have been asked to take morning and evening readings for two weeks before a follow-up appointment, and you want the average, highest and lowest of those readings on one page to hand over instead of a scribbled list.",
    "A parent's cuff shows 186/124 and you need to know immediately whether that is a wait-and-recheck number or the hypertensive-crisis threshold that means calling emergency services now.",
  ],
  benefits: [
    [
      "Both guidelines side by side",
      "Switch between ACC/AHA 2017 and ESC/ESH 2018 on the same reading instead of guessing which chart your doctor uses.",
    ],
    [
      "Classifies on both numbers",
      "A reading only lands in a category when systolic and diastolic are both within it, so a high bottom number is never hidden by a normal top number.",
    ],
    [
      "Thirty readings of context",
      "Stores your recent readings in the browser and shows average, highest and lowest, because a single measurement rarely reflects your real blood pressure.",
    ],
  ],
  faqs: [
    [
      "Is 130/80 high blood pressure?",
      "Under the ACC/AHA 2017 guideline, 130/80 mmHg is Stage 1 Hypertension — that guideline lowered the hypertension threshold from 140/90 to 130/80. Under the ESC/ESH 2018 guideline the same reading is only High Normal, since ESC/ESH keeps 140/90 as the start of Grade 1. The tool lets you switch guidelines to see both labels for one reading.",
    ],
    [
      "What blood pressure is a medical emergency?",
      "A reading above 180/120 mmHg is classified as a Hypertensive Crisis and needs emergency medical care rather than a recheck at home, especially if it comes with symptoms such as chest pain, breathlessness, vision changes or weakness. The tool flags anything past that threshold as Critical risk. Do not use a web page to manage a crisis reading — call emergency services.",
    ],
    [
      "What if my top number is normal but my bottom number is high?",
      "You are still classified into the higher category. The tool only assigns a reading to a category when both the systolic and the diastolic value fall inside it, so 118/94 is not Normal — the diastolic of 94 pushes it into Stage 1 under ACC/AHA and Grade 1 under ESC/ESH.",
    ],
    [
      "How many readings should I take before deciding anything?",
      "Single readings swing too much to act on; guidelines base decisions on averaged readings taken over days, which is why the tool keeps your last 30 and shows a running average, high and low. Home readings taken while seated and rested are often more representative than a one-off office measurement, but the interpretation is your clinician's to make.",
    ],
  ],
};

export default seo;
