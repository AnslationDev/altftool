const seo = {
  title: "South Africa Plug Guide: 230V, Type M and Type N",
  metaDescription:
    "South Africa runs 230 V at 50 Hz. Enter your plug and label range to see whether the type M, N, D or G socket takes it, and if you need a converter.",
  steps: [
    "Choose the 'Plug on your device' — type M, type N, type C Europlug, type D, type G and the rest are each listed with the countries that use them.",
    "Enter the Label minimum voltage (V), Label maximum voltage (V), Label frequency and Rated power (W) printed on the device's plate.",
    "'Verdict for South Africa' names which of the SANS 164-1 type M (15 A), SANS 164-2 type N (16 A), type D and type G sockets accept the plug, and whether you need only an adapter or a step-down converter; press Copy result.",
  ],
  intro:
    "This guide works out which South African socket will actually take your plug, and whether you also need a voltage converter. South Africa supplies 230 V at 50 Hz and is mid-way through a change of standard: the large three-round-pin SANS 164-1 socket (IEC type M, 15 A) still dominates existing buildings, while the 2018 edition of the wiring code SANS 10142-1 requires the slimmer SANS 164-2 socket (type N, 16 A) at every outlet point in new and rewired installations. Enter your plug and label details to see which outlets fit and what the load draws.",
  useCases: [
    "Checking before a Cape Town trip whether a European charger works in an older guesthouse or only in a new build.",
    "Understanding why one wall socket in the same room takes a Europlug and the one next to it does not.",
    "Confirming that a 2,200 W kettle sits inside the 15 A limit of the old type M outlet.",
  ],
  benefits: [
    ["Socket-by-socket answer", "Says which of the type M, type N, type D and type G outlets your plug enters, not just yes or no."],
    ["Covers the standards change", "Treats the old 15 A type M and the new 16 A type N as the two realities you will meet."],
    ["Adapter versus converter", "Compares the label voltage range against 230 V rather than leaving it to guesswork."],
  ],
  faqs: [
    [
      "What plug adapter do I need for South Africa?",
      "One that offers both the large three-round-pin type M shape and the slimmer type N shape. Type M (SANS 164-1) is what most existing buildings have; type N (SANS 164-2) has been required at new outlet points since the 2018 wiring code, so newer hotels and apartments have both. US, UK, Australian and Schuko plugs fit neither without an adapter.",
    ],
    [
      "Does a European two-pin plug work in South Africa?",
      "In a type N socket, yes — the SANS 164-2 outlet accepts a two-pin Europlug directly, which is why so many imported chargers work in new buildings. It will not enter the older type M socket, so carry an adapter rather than assuming every room has the new outlet.",
    ],
    [
      "What voltage and frequency does South Africa use?",
      "230 V at 50 Hz. Devices labelled 100-240V 50/60Hz — nearly every laptop, phone and camera charger — need only a shape adapter. A single-voltage 110 V or 120 V appliance needs a step-down transformer, and a 60 Hz-only motor or mains-timed clock will run roughly 17% slow.",
    ],
    [
      "How many watts can a South African wall socket take?",
      "About 3,450 W on the 15 A type M socket and about 3,680 W on the 16 A type N socket, since 15 A and 16 A at 230 V come to those figures. That is generous by world standards, but the circuit behind the socket and any multi-plug adaptor have their own lower limits, so do not chain heaters and kettles onto one outlet.",
    ],
  ],
};

export default seo;
