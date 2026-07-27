const seo = {
  intro:
    "This calculator builds cycling heart rate zones from lactate threshold heart rate rather than maximum heart rate, following Joe Friel's bike zone table — Zone 2 at 81–89% of LTHR, Zone 4 at 94–99%, Zone 5b at 103–106% — and pairs each band with the Coggan power zone that belongs next to it, calculated from your FTP in watts. If you have not tested your threshold, it is estimated at 85% of a cycling maximum heart rate, which itself sits around 5–10 beats below your running maximum. It is aimed at riders training with both a heart rate strap and a power meter who want the two data streams to agree.",
  useCases: [
    "Set the heart rate ceiling for a long endurance ride so you stay in Friel Zone 2 rather than drifting into tempo.",
    "Work out the bpm and watts you should see during 2 × 20 minute sub-threshold intervals.",
    "Rebuild your zones after a new FTP test moves your threshold power by 15 watts.",
    "Explain to a rider why their indoor trainer heart rate reads higher than the same watts outdoors.",
  ],
  benefits: [
    ["Threshold-based, not max-based", "Uses the Friel bike table, which is anchored to LTHR — the number that actually shifts as you get fitter."],
    ["Heart rate and watts side by side", "Every heart rate band names the Coggan power zone that belongs with it, in watts from your own FTP."],
    ["Handles the cycling offset", "Applies the documented 5–10 bpm gap between running and cycling maximum heart rate, adjustable to your own testing."],
  ],
  faqs: [
    [
      "Why are cycling heart rate zones different from running zones?",
      "Cycling uses less muscle mass and is not weight-bearing, so maximum heart rate on a bike typically measures 5–10 beats per minute below the same rider's running maximum, and threshold heart rate follows it down. Applying run zones to the bike puts every session slightly too hard.",
    ],
    [
      "How do I find my bike LTHR?",
      "Ride a hard 30-minute solo time trial and take your average heart rate over the final 20 minutes — that value is the standard field estimate of lactate threshold heart rate. Repeat it every 6–10 weeks, because threshold moves with fitness while maximum heart rate barely does.",
    ],
    [
      "What percentage of FTP is a tempo ride?",
      "Coggan Zone 3, tempo, runs from 76% to 90% of FTP. On a 250 W FTP that is 190–225 W. Zone 4, lactate threshold, is 91–105% (228–263 W) and Zone 5, VO2 max, is 106–120% (265–300 W).",
    ],
    [
      "Should I use heart rate or power for short intervals?",
      "Use power. Heart rate lags the effort by roughly 30 to 90 seconds, so for anything under about three minutes it never reaches the zone the effort belongs in, and it also drifts upward with heat, dehydration and fatigue. Use heart rate for steady endurance work and as a fatigue check. This is training information only, not medical advice.",
    ],
  ],
};

export default seo;
