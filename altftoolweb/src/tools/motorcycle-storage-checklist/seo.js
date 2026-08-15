const seo = {
  title: "Motorcycle Winter Storage Checklist: Battery",
  metaDescription:
    "Weeks stored, temperature and battery type set the list: projected state of charge, tyre pressure 25% above normal, fuel steps gated by duration.",
  steps: [
    "Enter Weeks in storage, average and coldest temperature, fuel system, battery type and your normal front, rear and sidewall tyre pressures.",
    "Pick Where it will stand — heated indoor garage, unheated garage or shed, outdoors under a cover — and tick paddock stands or ethanol-blended petrol.",
    "Work through the generated tasks with the projected state of charge and the storage tyre pressure capped at the sidewall maximum, then press Copy result.",
  ],
  intro:
    "This checklist is generated from how long the bike will stand, how cold the space gets, whether it is carburetted or injected, and which battery chemistry it has, rather than being a fixed list. It projects battery self-discharge using the rule that the rate roughly doubles for every 10 °C rise — about 4% a month at 20 °C for flooded lead-acid and 2% for AGM and LiFePO4 — and flags a maintainer once the projected state of charge would fall below the 80% point where sulfation accelerates. It also sets a storage tyre pressure 25% above normal, capped at the sidewall maximum, and adds the carburettor and stabiliser steps only past the durations where they actually matter.",
  useCases: [
    "Laying a bike up for a winter and wanting to know whether a battery maintainer is genuinely needed or just sold to everyone",
    "Working out whether float bowls need draining for a three-month stand on a carburetted classic",
    "Preparing a LiFePO4-equipped bike for storage in an unheated garage that drops below freezing",
  ],
  benefits: [
    ["Battery advice from arithmetic", "The projected state of charge is calculated from chemistry, temperature and duration, so the maintainer step appears only when it is warranted."],
    ["Duration-aware steps", "Stabiliser past four weeks, float bowls past eight, oil past eight — the list changes rather than telling everyone to do everything."],
    ["A bring-it-back list too", "The plugs, pressures and brake checks that matter on the first ride out are listed separately so nothing is missed."],
  ],
  faqs: [
    [
      "Do I need a battery tender for winter motorcycle storage?",
      "It depends on chemistry and temperature. A flooded lead-acid battery at 20 °C loses roughly 4% a month, so it drops below the 80% sulfation threshold in about five months, while an AGM at 10 °C loses closer to 1% a month and can sit through a winter on a full charge and a disconnected lead. A LiFePO4 battery should be disconnected at partial charge rather than floated, and never charged below 0 °C.",
    ],
    [
      "Should I drain the fuel or fill the tank for motorcycle storage?",
      "Fill a steel tank to about 95% and add a stabiliser rated for ethanol, because empty air space in the tank condenses water onto the bare steel. Carburettor float bowls are the exception and should be drained past about two months, since the small amount of fuel in them evaporates and leaves varnish that blocks the pilot jets.",
    ],
    [
      "What tyre pressure should I use for motorcycle storage?",
      "About 25% above the normal cold pressure, and never above the maximum moulded on the sidewall — so a tyre normally run at 33 psi goes to around 41 psi. Better still, put the bike on front and rear paddock stands so the tyres carry no load at all, which is the only complete answer to flat-spotting.",
    ],
    [
      "Should I change the oil before or after storing a motorcycle?",
      "Before, for any stand longer than about two months. Used oil holds acidic combustion by-products and water that attack bearing surfaces while the engine sits, so fresh oil should go in first and the engine should be run for a few minutes to circulate it. Follow the manufacturer's service schedule and consult a mechanic for anything the manual does not cover.",
    ],
  ],
};

export default seo;
