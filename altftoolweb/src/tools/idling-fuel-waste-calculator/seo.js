const seo = {
  title: "Idling Fuel Waste Calculator: Yearly Cost and CO2",
  metaDescription:
    "Engine size, signals a day and wait time give the litres, rupees and CO2 lost idling in a year, and what switching off past 10 seconds recovers.",
  steps: [
    "Under The vehicle set Engine size (litres), choose Petrol, Diesel or CNG, enter the fuel price and Mileage, and tick 'Air conditioning running while stopped' if the AC stays on at halts.",
    "Under How much you idle enter Signals and halts per day, Average wait at each halt (seconds), Other engine-on waiting (minutes a day) and Driving days per month.",
    "Wasted idling per year gives the rupee figure, the litres burnt and the kilometres that fuel would have driven, with the CO2 a year and the share recoverable by switching off at halts longer than 10 seconds; Copy result saves it.",
  ],
  intro:
    "An idling engine achieves zero kilometres per litre, and this calculator prices that directly. Idle fuel flow is friction plus accessory load rather than anything to do with speed, so it scales with engine displacement — about 0.5 litres per hour per litre of a petrol engine and 0.35 for a diesel, roughly 30% higher again with the AC on. Multiply by the seconds you actually spend stationary with the engine running and you get the litres, rupees and CO2 a year, plus how much of it switching off would recover once each restart's fuel is netted off.",
  useCases: [
    "You sit through fifteen signals a day in city traffic and want to see the annual cost written as one number.",
    "You are deciding whether an idle-stop equipped variant is worth its price premium and need the fuel it would actually save.",
    "You run a small fleet of delivery vehicles and want a figure to put in front of drivers about engine-off discipline.",
  ],
  benefits: [
    ["Engine size matters", "A 2.2 litre diesel and a 1.0 litre petrol do not idle at the same rate, so displacement drives the calculation."],
    ["Restart cost netted off", "Only idle time beyond the roughly ten seconds a restart costs is counted as recoverable, so the saving is not overstated."],
    ["Translated into distance", "Shows how many kilometres the wasted fuel would have driven, which lands harder than a litre count."],
  ],
  faqs: [
    [
      "How much fuel does a car use while idling?",
      "Roughly 0.5 litres an hour per litre of engine displacement for petrol, so about 0.75 L/h for a 1.5 litre engine and 1.0 L/h for a 2.0 litre. Diesels idle leaner at around 0.35 L/h per litre. Running the air conditioning adds about 30% on top, because there is no airflow over the condenser while stationary.",
    ],
    [
      "How long should you idle before switching the engine off?",
      "About ten seconds. Restarting a warm fuel-injected engine consumes roughly the fuel of ten seconds of idling, so any halt longer than that is cheaper with the engine off. This is the same threshold factory idle-stop systems use, and why signal-side campaigns target waits of 30 seconds and more.",
    ],
    [
      "Does switching the engine off at signals damage the starter?",
      "On a modern car, minimally. Engines designed with idle-stop use reinforced starters and batteries rated for hundreds of thousands of cycles. On an older vehicle, frequent restarts do add wear to the starter motor and battery, so it is worth reserving engine-off for the longer waits rather than every brief halt.",
    ],
    [
      "Does an engine need to warm up by idling?",
      "Not on a modern fuel-injected engine — 30 seconds is enough before driving off gently. Extended idling actually warms the engine more slowly than light driving does, wastes fuel, and in a diesel can cause unburnt fuel to wash the bores, so long warm-up idling is a habit worth dropping.",
    ],
  ],
};

export default seo;
