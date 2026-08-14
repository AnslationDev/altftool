const seo = {
  title: "dB to Percentage Converter: Amplitude and Power",
  metaDescription:
    "Enter dB, a percentage or a gain multiplier and read all four: 20·log10 amplitude and 10·log10 power ratios, each as a percentage.",
  steps: [
    "Set \"I am entering\" to Decibels (dB), Amplitude percentage, Power percentage or Linear amplitude ratio (gain), then type your figure into the Value field, whose unit label follows the mode.",
    "Or press one of the shortcut chips — -60, -20, -12, -6, -3, 0, 3 or 6 dB — to jump straight to that level.",
    "Read the Amplitude percentage headline with its gain multiplier, plus the Amplitude ratio, Power ratio, Power percentage and perceived-loudness rows and the Reference points table, then press Copy result.",
  ],
  intro:
    "dB To Percentage Converter turns a decibel value into the linear amplitude ratio, power ratio and percentage it represents, and converts back from any of them. It applies the two standard definitions from IEC 60027-3: dB = 20·log10(ratio) for amplitude quantities such as voltage, sound pressure and sample values, and dB = 10·log10(ratio) for power quantities such as watts and intensity. Useful when you need the actual multiplier for a gain node, a normalisation step or a spec sheet rather than a rule of thumb.",
  useCases: [
    "Setting a Web Audio GainNode: −6 dB is a gain value of 0.501, not 0.94 or 0.5 of the slider travel.",
    "Reading an RF or amplifier spec that quotes power in dB and converting it to a percentage of full output.",
    "Checking that a −60 dBFS noise floor really is 0.1% of full-scale amplitude before signing off a master.",
    "Explaining why turning a mix down 3 dB halves the power but only drops amplitude to about 71%.",
  ],
  benefits: [
    ["Both dB definitions", "Amplitude uses 20·log10 and power uses 10·log10 — the tool shows each side by side."],
    ["Works in reverse", "Enter a percentage or a raw gain multiplier and get the decibel value back."],
    ["Honest about perception", "Separates the physical ratio from the ~10 dB-per-doubling loudness rule of thumb."],
  ],
  faqs: [
    [
      "What percentage is −6 dB?",
      "About 50.1% in amplitude and 25.1% in power. The exact half-amplitude point is −6.0206 dB, which is why −6 dB is commonly described as halving the signal even though it is a fraction over.",
    ],
    [
      "Why is −3 dB half and −6 dB also half?",
      "They halve different quantities. −3.0103 dB halves power (10·log10 0.5), while −6.0206 dB halves amplitude (20·log10 0.5). Since power is proportional to amplitude squared, halving amplitude quarters the power.",
    ],
    [
      "How many dB is twice as loud?",
      "Physically, +6.02 dB doubles amplitude and +3.01 dB doubles power. Perceptually, most listeners report a doubling of loudness at roughly +10 dB, which matches the sone scale where loudness doubles per 10 phon. The perceptual figure varies with level, spectrum and listener.",
    ],
    [
      "Is a DAW fader at 50% the same as −6 dB?",
      "No. A fader's physical travel follows a taper chosen by the manufacturer, so halfway up is typically somewhere between −10 dB and −20 dB rather than −6 dB. Read the numeric dB readout on the channel rather than the slider position.",
    ],
  ],
};

export default seo;
