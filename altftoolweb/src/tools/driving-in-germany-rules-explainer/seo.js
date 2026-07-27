const seo = {
  intro:
    "This explainer sets out the rules a visiting driver actually has to obey in Germany: drive on the right, 50 km/h in built-up areas, 100 km/h on country roads, and no general limit on unrestricted Autobahn where 130 km/h is only an advisory speed. It works out which blood-alcohol limit applies to you personally — 0.05 % under StVG §24a, or an absolute zero under §24c if you are under 21 or still in the two-year probationary period — and whether your licence needs an International Driving Permit alongside it. Speeds are shown in km/h and mph together, and a Widmark-equation estimate shows how long alcohol from the night before is likely to stay in your system.",
  useCases: [
    "You have hired a car at Frankfurt airport on a US licence and need to know whether the IDP in your bag is actually required and how long the licence stays valid.",
    "You are 20 years old, driving with friends through Bavaria, and want to confirm that the German alcohol limit for your age is zero rather than 0.5 per mille.",
    "You are towing a caravan to the Black Forest and need the trailer speed caps, which are 80 km/h outside built-up areas rather than the 100 km/h cars get.",
  ],
  benefits: [
    ["Limits in both units", "Every speed is shown in km/h and mph, so a UK or US driver can read the sign and the dial at once."],
    ["Age-aware alcohol rule", "Applies the under-21 and probationary-period zero limit instead of quoting one figure to everybody."],
    ["Kit checklist", "Warning triangle, DIN 13164 first-aid kit, vest and Umweltplakette — the items German roadside checks actually ask for."],
  ],
  faqs: [
    [
      "Is there really no speed limit on the German Autobahn?",
      "On roughly two thirds of the network there is no general numeric limit for cars, but 130 km/h is the official Richtgeschwindigkeit or advisory speed. Exceeding it is not an offence in itself, yet if you crash above 130 km/h a German court can assign you part of the liability even when the other driver caused the collision. Posted limits, roadworks and variable gantry signs are binding everywhere they appear.",
    ],
    [
      "What is the drink-drive limit in Germany?",
      "0.5 per mille, which is 0.05 % blood alcohol or 0.25 mg per litre of breath, for fully licensed drivers aged 21 and over. Drivers under 21 and anyone inside the two-year Probezeit face an absolute ban at 0.0. From 0.3 per mille you can already be prosecuted under StGB §316 if your driving shows impairment or you are involved in a crash.",
    ],
    [
      "Do I need an International Driving Permit to drive in Germany?",
      "Not with an EU or EEA licence, which is recognised in full. With a non-EU licence you should carry an International Driving Permit or a certified German translation alongside the original, and the foreign licence stops being valid six months after you take up ordinary residence, at which point you must apply for an Umschreibung.",
    ],
    [
      "What is the Rettungsgasse and when do I have to form one?",
      "It is the emergency corridor you must open as soon as traffic on a multi-lane road slows to a crawl — the far-left lane pulls left, every other lane pulls right, before the emergency vehicles arrive. Failing to form it is fined €200 to €320 with two points and a one-month driving ban, and obstructing rescue services can be a criminal offence.",
    ],
  ],
};

export default seo;
