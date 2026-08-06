const seo = {
  intro:
    "This explainer reads the input range printed on your appliance against the mains at your destination and says whether a plug adapter is enough or a real voltage converter is required. A plug adapter changes only the pin shape; a converter or transformer changes the voltage; neither changes frequency. If the label says 100-240V ~ 50/60Hz the appliance is dual voltage and needs nothing but a shape adapter anywhere, and if it names a single voltage the tool sizes the converter using the standard headroom rules — 1.25× nameplate watts for a heating element, 1.5× for electronics and 3× for a motor.",
  useCases: [
    "Checking whether a 120 V American hair dryer can be used in Europe, and finding that 1,600 W needs at least a 2,000 VA step-down unit — a chopping travel converter works for the short duty a heating element is rated for, but a wound transformer is the safer choice for a full-length dry.",
    "Confirming a 100-240 V laptop charger only needs a plug adapter in India, with no converter at all.",
    "Working out that a 100 V 50 Hz Japanese shaver on a 120 V 60 Hz supply needs both a step-down transformer and an acceptance that the motor runs 20% fast.",
  ],
  benefits: [
    [
      "Reads the label, not the country",
      "The input voltage range on the appliance decides it, and dual-voltage kit needs no converter anywhere.",
    ],
    [
      "Sizes the converter in VA",
      "Nameplate watts times the right headroom factor, so you buy a unit that will not overheat.",
    ],
    [
      "Separates chopping converters from transformers",
      "Cheap travel converters suit heating elements only; electronics and motors need a wound transformer.",
    ],
  ],
  faqs: [
    [
      "Do I need a voltage converter or just a plug adapter?",
      "Just an adapter if the appliance label covers the destination voltage — anything marked 100-240V is dual voltage and works worldwide with a shape adapter. You need a converter only when the label names a single voltage the destination does not match, for example a 120 V-only device in Europe's 230 V or a 230 V-only device in the United States' 120 V. Phone chargers, laptop bricks and camera chargers are almost always dual voltage; hair dryers, kettles, curling irons and shavers frequently are not.",
    ],
    [
      "What size voltage converter do I need?",
      "Take the appliance's nameplate watts and add headroom: about 1.25× for a pure heating element, 1.5× for electronics to cover inrush and poor power factor, and 3× for a motor or compressor because locked-rotor starting current is several times running current. A 1,600 W hair dryer therefore needs at least 2,000 VA, and a 100 W motor appliance needs 300 VA.",
    ],
    [
      "Can a travel voltage converter be used with a laptop or phone charger?",
      "No, and it is almost never necessary. Cheap travel converters chop the waveform with a triac or diode, delivering a rough half-wave rather than a sine, which damages switch-mode and linear power supplies; they are also short-duty rated, commonly only around 15 minutes. Laptops and phone chargers are dual voltage anyway, so a plug adapter is all they need. Where electronics genuinely need converting, use a wound transformer.",
    ],
    [
      "Does a voltage converter change 50 Hz to 60 Hz?",
      "No. Converters and transformers change voltage only, and no travel-sized product changes mains frequency. Heating elements and switch-mode supplies generally do not care, but a synchronous motor rated 50 Hz runs 20% faster on 60 Hz, and mains-timed clocks and timers drift. For a motor appliance this is a reason to buy a local version rather than convert.",
    ],
  ],
};

export default seo;
