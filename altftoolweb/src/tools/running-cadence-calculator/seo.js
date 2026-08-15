const seo = {
  title: "Running Cadence Calculator - Steps/Min & Stride Length",
  metaDescription:
    "Turn a 30-second step count into steps per minute, step and stride length, a metronome BPM, and safe +5% and +10% cadence targets at the same speed.",
  steps: [
    "Choose How are you measuring? - Count steps over a timed window or I already know my cadence - then fill in Steps counted, the Counting window (seconds), your Height (cm) and your pace per km; tick I counted one foot only if you tracked a single leg.",
    "Read the live result: cadence in spm with its band, Strides per minute, a Metronome setting in BPM, Step length in cm, Stride length in metres and Step length as % of height.",
    "Check the Progression targets at the same speed table for the +5% and +10% cadence steps with their metronome BPM and shortened step length, then press Copy result for a text summary or Reset to start over.",
  ],
  intro:
    "The Running Cadence Calculator converts a timed step count into steps per minute, then derives step length and stride length from your running pace using step length = speed in metres per minute divided by cadence. It also sets 5% and 10% progression targets at the same speed, the increments used in clinical gait-retraining work on running load. Aimed at runners checking whether they overstride and wanting a metronome number to work with.",
  useCases: [
    "Count 80 steps in 30 seconds on an easy run and see that this is 160 steps per minute with a 104 cm step length.",
    "Find the metronome BPM to set for a 5% cadence increase without running any faster.",
    "Compare step length against height to see how far in front of the body the foot is landing.",
    "Check cadence at 5K pace against easy pace to understand how step rate scales with speed.",
  ],
  benefits: [
    ["Counts either foot", "Handles a one-foot count by doubling it, the usual source of a halved cadence reading."],
    ["Step length included", "Derives step and stride length from pace, so you can see what a cadence change does to your stride."],
    ["Graded progression", "Sets 5% and then 10% targets rather than pushing straight to an arbitrary round number."],
  ],
  faqs: [
    [
      "How do I measure my running cadence without a watch?",
      "Run at a steady pace, count every time either foot lands for 30 seconds, then double it. Counting only your right foot for 30 seconds and multiplying by four gives the same answer and is easier to keep track of.",
    ],
    [
      "Is 180 steps per minute the ideal running cadence?",
      "No single number is ideal. The 180 figure comes from Jack Daniels observing elite distance runners at the 1984 Olympics, who were racing. Cadence rises with speed and falls with height, so recreational runners commonly sit between 155 and 175 at easy pace, which is not in itself a fault.",
    ],
    [
      "How much should I increase my cadence by?",
      "Gait-retraining studies typically use 5% and 10% above habitual step rate, because those increments measurably reduce the mechanical load absorbed at the knee and hip while remaining comfortable. Change one increment at a time and keep your speed the same so the step gets shorter rather than the run getting faster.",
    ],
    [
      "What is the difference between cadence and stride rate?",
      "Cadence counts every foot strike, so both feet. A stride is two steps, from one left foot strike to the next, so stride rate is exactly half of cadence: 170 steps per minute is 85 strides per minute.",
    ],
  ],
};

export default seo;
