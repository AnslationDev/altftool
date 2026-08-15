const seo = {
  title: "Gain Staging Calculator: dBFS to dBu, dBV",
  metaDescription:
    "Convert one level between dBFS, dBu, dBV, volts RMS and percent under EBU R68, SMPTE RP155 or ARD alignment, with the gain move to hit a target dBFS.",
  steps: [
    "Type the Level, choose its Unit — dBFS, dBu, dBV, Volts RMS or % of full scale — and pick an 'Alignment standard' such as 'EBU R68 — 0 dBu at −18 dBFS'.",
    "Adjust '0 dBFS equals (dBu)' for a custom alignment and set the 'Target level for the gain move (dBFS)'.",
    "Read the dBFS headline with headroom to clipping, the dBu, dBV, voltage, percent and 16/24-bit sample rows, and the dB gain change with fader multiplier, then press 'Copy result'.",
  ],
  intro:
    "This calculator converts one audio level between dBFS, dBu, dBV, volts RMS and percent of full scale. dBu and dBV are absolute voltage scales — 0 dBu is 0.7746 V RMS and 0 dBV is 1 V RMS — while dBFS only becomes a voltage once an alignment standard fixes how much analogue headroom sits above the reference level, which is why the tool asks which standard you work to. Engineers use it to line up converters, patch analogue gear into a digital session and keep every stage in its linear range.",
  useCases: [
    "Checking that a −18 dBFS test tone leaves an interface at exactly 0 dBu under EBU R68 alignment",
    "Translating a US broadcast spec written in dBu into the dBFS number your DAW meter shows",
    "Finding the gain change needed to move a track sitting at −6 dBFS down to the −18 dBFS plugin sweet spot",
  ],
  benefits: [
    ["Alignment aware", "EBU R68, SMPTE RP155 and ARD presets, plus a custom 0 dBFS-equals-dBu field."],
    ["Every unit at once", "dBFS, dBu, dBV, volts, millivolts, percent and raw 16/24-bit sample values."],
    ["Gain move included", "Shows the dB change and fader multiplier to reach a target level."],
  ],
  faqs: [
    [
      "What is 0 dBu in volts?",
      "0 dBu is 0.7746 V RMS — the voltage that dissipates 1 milliwatt into a 600 ohm load. Professional line level of +4 dBu is 1.228 V RMS, and consumer −10 dBV is 0.316 V RMS, which works out at about −7.8 dBu.",
    ],
    [
      "What does −18 dBFS equal in dBu?",
      "Under EBU R68, −18 dBFS is exactly 0 dBu, which is why European broadcast gear is often described as having 18 dB of headroom. Under SMPTE RP155 the reference sits at −20 dBFS = +4 dBu, so full scale corresponds to +24 dBu.",
    ],
    [
      "What level should I record at?",
      "Aim for peaks around −12 dBFS and an average near −18 dBFS. That keeps transients clear of clipping and puts the signal where analogue-modelled plugins expect 0 VU, while 24-bit recording means the extra headroom costs no audible noise.",
    ],
    [
      "Is 50% on a fader the same as −6 dB?",
      "No. −6.02 dBFS is 50% amplitude, but most DAW faders use a tapered scale where the halfway travel point is nearer −10 to −15 dB. The percentage shown here is linear sample amplitude, not fader travel.",
    ],
  ],
};

export default seo;
