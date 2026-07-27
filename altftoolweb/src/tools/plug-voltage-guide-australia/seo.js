const seo = {
  intro:
    "This guide decides whether your device needs a plug adapter, a voltage converter, or nothing at all in Australia. Australia supplies 230 V at 50 Hz on the AS/NZS 3112 socket — the two flat pins in a shallow V plus a vertical earth pin that the IEC calls type I — and the same standard covers New Zealand, Fiji and Papua New Guinea. Enter your plug type and the voltage range printed on the label to get the verdict, the current the device draws and the smallest socket rating that carries it.",
  useCases: [
    "Checking before a Sydney trip whether a European or US charger needs more than a shape adapter.",
    "Working out why a 15 A caravan lead will not go into an ordinary 10 A house socket.",
    "Seeing whether a 2,400 W appliance exceeds the 2,300 W a standard Australian outlet can supply.",
  ],
  benefits: [
    ["Handles the pin-width ladder", "Reports the 10 A, 15 A, 20 A or 32 A outlet the load actually needs, not just a yes or no."],
    ["Adapter versus converter", "Compares the label voltage range against 230 V instead of leaving it to guesswork."],
    ["Flags look-alike type I plugs", "Marks the Chinese and Argentine variants that fit the socket but do not share AS/NZS wiring."],
  ],
  faqs: [
    [
      "What plug adapter do I need for Australia?",
      "A type I adapter, the AS/NZS 3112 flat angled-pin shape. Australian sockets have no round-pin provision at all, so a European Europlug, a UK type G plug and a US type A or B plug will all need an adapter. New Zealand, Fiji and Papua New Guinea use the same socket.",
    ],
    [
      "What voltage does Australia use?",
      "230 V at 50 Hz, allowed to sit between roughly 216 V and 253 V (230 V +10% / -6%). Devices labelled 100-240V 50/60Hz — nearly every laptop, phone and camera charger — work with just a plug adapter. A single-voltage 110 V or 120 V appliance needs a step-down transformer, not an adapter.",
    ],
    [
      "Why won't my 15 A plug fit an Australian power point?",
      "Because the 15 A version of the AS/NZS 3112 plug has a wider earth pin than the 10 A version, and a 10 A socket has a matching narrow earth slot. Plugs only fit upwards: a 10 A plug goes into a 15 A or 20 A socket, but a 15 A caravan or welder lead needs a 15 A outlet. Filing the pin down is illegal and defeats the point of the system.",
    ],
    [
      "How many watts can an Australian power point take?",
      "About 2,300 W on the standard 10 A outlet, since 10 A at 230 V is 2,300 W. A 15 A outlet allows roughly 3,450 W and a 20 A outlet about 4,600 W. Add up everything on one socket or power board before plugging in a heater, kettle or air fryer.",
    ],
  ],
};

export default seo;
