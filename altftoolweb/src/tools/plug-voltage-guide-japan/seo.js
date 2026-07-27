const seo = {
  intro:
    "Japan supplies mains power at 100 V — the lowest national voltage in the world — through Type A sockets, on a grid that runs at 50 Hz in the east and 60 Hz in the west. This guide takes the country your device was bought in, where in Japan you are going and the figures printed on the device label, and tells you whether you need a plug adapter, a voltage converter, or nothing. For heating appliances it also works out the real power on 100 V using the resistive relation P = V²/R, which is why a 120 V, 1800 W hair dryer delivers only 1250 W in Japan.",
  useCases: [
    "Check before packing whether a hair dryer or straightener from home will actually work in a Tokyo hotel.",
    "Work out whether a trip that covers both Tokyo and Kyoto crosses the 50 Hz / 60 Hz boundary and whether that matters.",
    "Confirm that a laptop charger marked 100-240V only needs a Type A plug adapter and no transformer.",
  ],
  benefits: [
    ["Adapter and converter kept separate", "Says plainly which one you need — a plug adapter changes pin shape only and does nothing to voltage."],
    ["Real power on 100 V", "Applies the V² relation to heating elements so you see the actual wattage and how much longer it takes to heat."],
    ["Handles the grid split", "Maps 27 cities to their 50 Hz or 60 Hz utility, and flags devices whose speed depends on frequency."],
  ],
  faqs: [
    [
      "What voltage and plug does Japan use?",
      "Japan uses 100 V, the lowest national mains voltage anywhere, with Type A sockets — two flat parallel blades — and less commonly Type B, which adds a round earth pin. Frequency is 50 Hz in eastern Japan and 60 Hz in the west. Most residential circuits are rated 15 A, giving a practical ceiling of about 1,500 W per socket.",
    ],
    [
      "Do I need a voltage converter in Japan?",
      "Not if your device label reads 100-240V, which covers almost all phone, laptop and camera chargers. You do need one for a single-voltage appliance rated 220-240 V: it will not be damaged by Japan's 100 V, but a 2,000 W kettle would deliver only about 380 W and take more than five times as long to boil. Never plug in a device rated below 100 V without a step-down converter.",
    ],
    [
      "Why does Japan have both 50 Hz and 60 Hz?",
      "Because of a purchasing decision in the 1890s. Tokyo bought 50 Hz generators from AEG in Germany while Osaka bought 60 Hz machines from General Electric in the United States, and the two systems grew outward until they met. The boundary now runs roughly along the Fuji River in Shizuoka and the Itoigawa in Niigata, and only a few frequency converter stations link the halves — which is why power could not be freely moved east after the 2011 Tohoku earthquake.",
    ],
    [
      "Will my American plug fit a Japanese socket?",
      "Usually, but not always. Japan and North America share the Type A two-blade shape, however many Japanese sockets are unpolarised with both slots the same width, while modern US plugs have one wider neutral blade that will not enter them. A three-pin Type B plug needs an earthed socket that plenty of Japanese buildings lack. A cheap Type A or three-to-two adapter solves both cases.",
    ],
  ],
};

export default seo;
