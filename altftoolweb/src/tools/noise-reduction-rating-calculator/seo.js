const seo = {
  title: "NRR Calculator: OSHA, OSHA 50% and NIOSH Deratings",
  metaDescription:
    "Turn an NRR or SNR label into the level at the ear using dBA - (NRR - 7), OSHA's 50% factor or NIOSH deratings, against the 90 and 85 dBA limits.",
  steps: [
    "Enter the \"Measured noise level (dB)\", set \"Meter weighting used\" to A or C, choose the \"Label system\" (NRR or SNR) and type the labelled rating into \"Labelled NRR (dB)\".",
    "Pick the \"Protector type\" and \"Hours in the noise per shift\", choose a \"Field-adjustment method\", and tick \"Dual protection — plugs and muffs worn together\" to add a second device rating.",
    "Read \"Estimated level at the ear\" with the attenuation subtracted, compare the \"Same protector, all three methods\" table (Method, Attenuation, At the ear, OSHA PEL), then press \"Copy result\".",
  ],
  intro:
    "The Noise Reduction Rating Calculator estimates the A-weighted sound level actually reaching a worker's ear by applying the published field-adjustment formulas to a hearing protector's labelled NRR or SNR. It covers the three methods safety officers are asked for: the plain OSHA formula (dBA − [NRR − 7]), OSHA's recommended 50% safety factor (dBA − [(NRR − 7) × 50%]), and the NIOSH deratings from Publication 98-126 that cut the label by 25% for earmuffs, 50% for formable foam earplugs and 70% for all other earplugs. It also handles dual protection using the 5 dB allowance added to the higher-rated device, then checks the resulting level against the OSHA permissible exposure limit of 90 dBA and the NIOSH recommended limit of 85 dBA.",
  useCases: [
    "A safety officer checks whether NRR 33 foam plugs are enough for a 100 dBA press shop: the plain OSHA formula says 74 dBA, but OSHA's 50% safety factor says 87 dBA and the NIOSH derating says 90.5 dBA — still at the permissible limit.",
    "An industrial hygienist compares plugs alone against plugs plus muffs for a 105 dBA task, using the 5 dB dual-protection allowance rather than adding the two ratings together.",
    "An EHS manager converts a European SNR label onto the NRR scale to fill in a US hearing conservation programme record, and checks the result is not below 70 dBA at the ear.",
  ],
  benefits: [
    [
      "Three published methods, one screen",
      "The comparison table runs the same protector through the plain OSHA formula, the OSHA 50% safety factor and the NIOSH device derating, so you can see how far apart the estimates are before choosing a device.",
    ],
    [
      "dBA and dBC handled correctly",
      "The 7 dB spectral correction exists only because NRR is derived from C-weighted test data — so it is applied to a dBA measurement and skipped entirely for a dBC one, instead of being subtracted blindly.",
    ],
    [
      "Overprotection flagged, not just underprotection",
      "A level below 70 dBA at the ear is called out as overprotection, because a worker who cannot hear alarms, speech or machine cues is not safer for wearing a higher-rated protector.",
    ],
  ],
  faqs: [
    [
      "How do you calculate protected noise level from NRR?",
      "For a level measured in dBA, estimated exposure = dBA − (NRR − 7). The 7 dB is subtracted because NRR is derived from C-weighted laboratory data. For a level measured in dBC, no correction applies and estimated exposure = dBC − NRR. Example: NRR 33 plugs in 100 dBA give 100 − (33 − 7) = 74 dBA before any safety factor.",
    ],
    [
      "Why does OSHA recommend derating the NRR by 50%?",
      "Because laboratory NRR values are obtained under trained, experimenter-supervised fitting that real workplaces do not reproduce, so OSHA's directive CPL 02-02-035 recommends halving the field-adjusted value: dBA − [(NRR − 7) × 50%]. The same NRR 33 plug in 100 dBA then gives 87 dBA rather than 74 dBA — under the 90 dBA permissible limit, but above the 85 dBA NIOSH limit.",
    ],
    [
      "What are the NIOSH derating factors for hearing protectors?",
      "NIOSH Publication 98-126 says to subtract 25% from a labelled earmuff rating, 50% from a formable (slow-recovery foam) earplug rating and 70% from all other earplug ratings, then apply the 7 dB A-weighting correction. NRR 33 foam plugs therefore give 33 × 0.5 − 7 = 9.5 dB of usable attenuation, so 100 dBA becomes 90.5 dBA.",
    ],
    [
      "Do you add the NRR of earplugs and earmuffs when wearing both?",
      "No. Both OSHA and NIOSH allow only 5 dB to be added to the higher of the two labelled ratings, because bone conduction sets a practical ceiling of roughly 40 to 50 dB regardless of what is on the ear. NRR 33 plugs under NRR 25 muffs are treated as NRR 38, not 58, before the chosen derating method is applied.",
    ],
  ],
};

export default seo;
