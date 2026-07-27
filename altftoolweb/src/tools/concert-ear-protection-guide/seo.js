const seo = {
  intro:
    "Hearing protectors are labelled with a Noise Reduction Rating (NRR) in the United States, a Single Number Rating (SNR) in Europe, or a flat attenuation figure for musician filters — and the three are applied to a noise level in different ways. This guide converts whichever number is on your packet into the level actually reaching your ear: it subtracts the 7 dB A-weighting correction from an NRR and then applies the NIOSH real-world derating (25% for earmuffs, 50% for foam plugs, 70% for other plugs), subtracts SNR from the C-weighted level, and subtracts a flat filter figure directly. It then compares the protected level against the NIOSH limit of 85 dB(A) for 8 hours with a 3 dB exchange rate.",
  useCases: [
    "Checking whether 20 dB musician filters are enough for three hours at a 105 dB(A) front-of-stage position",
    "Comparing a foam plug rated NRR 33 with earmuffs rated NRR 31 once real-world derating is applied",
    "Working out how much shorter a night in the pit would need to be to stay inside the daily noise dose",
  ],
  benefits: [
    ["Derated, not label numbers", "Applies the NIOSH derating so the figure reflects the fit people actually get, not laboratory conditions."],
    ["All three rating systems", "NRR, SNR and flat musician filter ratings in one place, each with its own correct method."],
    ["Time as well as level", "Shows the safe duration before and after protection, so the answer is a plan and not just a decibel number."],
  ],
  faqs: [
    [
      "What NRR do I need for a concert?",
      "At a typical 100 to 105 dB(A) gig, look for roughly 15 to 20 dB of real-world reduction. A foam plug labelled NRR 33 gives about 9.5 dB after the 7 dB correction and the 50% NIOSH derating, so a well-fitted plug or a 20 dB flat filter is the more honest choice for front-of-stage positions.",
    ],
    [
      "Is NRR or SNR better?",
      "Neither is better protection — they are different labelling standards. NRR (US, ANSI S3.19) is subtracted from an A-weighted level after a 7 dB correction; SNR (EU, EN ISO 4869-2) is subtracted from the C-weighted level. SNR figures generally look a few decibels higher than the NRR for the same product because of how each is measured.",
    ],
    [
      "How loud is a concert in decibels?",
      "Live amplified music commonly measures 95 to 105 dB(A) on the floor and can reach 110 dB(A) at the barrier of a festival main stage. At 105 dB(A) the NIOSH exposure limit is reached in under five minutes, which is why unprotected attendance at a full set is well over the daily dose.",
    ],
    [
      "Do musician earplugs reduce sound quality?",
      "Less than foam does. Foam plugs attenuate high frequencies far more than low ones, which is what makes music sound muffled and bass-heavy. Filtered musician earplugs are designed for roughly even attenuation across the spectrum — typically 15, 20 or 25 dB — so the balance of the mix survives while the level drops.",
    ],
  ],
};

export default seo;
