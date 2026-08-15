const seo = {
  title: "Monsoon Driving Readiness Check – Tread, PSI",
  metaDescription:
    "Enter tread depth and tyre pressure to get wet braking distance in metres, aquaplaning onset speed from NASA's 9√p formula, and an 18-point checklist.",
  steps: [
    "Measure and enter Tread depth (mm), Cold tyre pressure (psi) and the speed you actually cruise at (km/h).",
    "Tick the weighted checklist grouped under Tyres & brakes, Visibility, Sealing & electricals and Documents & kit.",
    "Read Stopping distance in rain with its verdict, plus aquaplaning onset speed, rain following gap and checklist points; press Copy result.",
  ],
  intro:
    "A monsoon driving readiness checker turns two measurements — tread depth and cold tyre pressure — into the numbers that decide a wet-weather stop. Braking distance is computed as v²/(2μg) with a wet friction coefficient chosen from your tread depth, reaction distance uses a 1.5-second wet reaction time, and the aquaplaning onset speed comes from the NASA rotating-tyre formula V = 9√p knots (Horne & Dreher, TN D-2056). A weighted eighteen-point checklist covers everything a gauge cannot measure.",
  useCases: [
    "Deciding in June whether tyres at 3 mm will last another monsoon or need replacing now",
    "Showing a family driver why 80 km/h on a wet expressway needs a four-second gap, in metres",
    "Running a pre-rains inspection over wipers, demisting, seals and insurance in one pass",
  ],
  benefits: [
    ["Distances, not adjectives", "Reports the actual extra metres your worn tread costs at your cruising speed."],
    ["Aquaplaning from your own psi", "Uses the published NASA formula rather than a generic 'slow down in rain'."],
    ["Blockers flagged separately", "A dead wiper or an untested brake stops the checklist instead of costing a few points."],
  ],
  faqs: [
    [
      "What is the minimum legal tyre tread depth in India?",
      "1.6 mm in the principal grooves for passenger cars, set by Rule 94 of the Central Motor Vehicles Rules. That is a legal floor, not a safe one — wet grip falls away below about 3 mm, which is where most tyre makers advise replacement before a monsoon.",
    ],
    [
      "At what speed does aquaplaning start?",
      "For a rotating tyre the onset speed in knots is roughly nine times the square root of the inflation pressure in psi, so about 94 km/h at 32 psi and only about 85 km/h at 26 psi. Because the speed scales with the square root of pressure, an under-inflated tyre starts floating noticeably earlier — which is why weekly cold pressure checks matter more in the rains.",
    ],
    [
      "How much longer does it take to stop on a wet road?",
      "Typically 50% to 70% longer than on dry tarmac at the same speed. From 80 km/h a car with healthy tread needs roughly 54 m dry and about 84 m wet, because the friction coefficient drops from around 0.8 to 0.5 and rain adds about half a second to reaction time.",
    ],
    [
      "Should I use hazard lights while driving in heavy rain?",
      "No. Hazard lights disable or mask your indicators on most cars, so nobody can tell when you are about to change lane or turn, and a stationary-hazard signal on a moving car confuses everyone behind you. Use headlights on low beam, or fog lamps if fitted, and slow down instead.",
    ],
  ],
};

export default seo;
