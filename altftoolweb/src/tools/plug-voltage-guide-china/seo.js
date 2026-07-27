const seo = {
  intro:
    "This guide decides whether your device needs a plug adapter, a voltage converter, or nothing at all in mainland China. China supplies 220 V at 50 Hz and the IEC lists three plug types in use — type A (two flat pins), type C (Europlug) and the earthed GB 2099 type I — with the everyday wall outlet being a combination faceplate that takes both A and I. Enter your plug and the voltage range on the label to get the verdict, the current drawn, and a reminder that Hong Kong and Macau run British type G sockets instead.",
  useCases: [
    "Checking before a Shanghai trip whether a US charger fits the combination socket without an adapter.",
    "Working out what a 230 V European kettle actually delivers on China's 220 V supply.",
    "Planning a trip that includes both Beijing and Hong Kong, where the socket standard changes at the border.",
  ],
  benefits: [
    ["Quantifies under-volting", "Applies the P = V squared over R rule to show what a resistive appliance delivers at 220 V instead of guessing."],
    ["Flags look-alike type I plugs", "Marks the Australian and Argentine variants that fit the socket but do not share Chinese wiring."],
    ["Covers Hong Kong and Macau", "Reminds you that the SARs use type G, so one mainland adapter is not enough."],
  ],
  faqs: [
    [
      "What plug adapter do I need for China?",
      "A type I adapter for mainland China — the flat angled-pin GB 2099 shape. Type A (two flat parallel pins) and type C (the two-pin round Europlug) also appear on the IEC's list for China, so US two-pin and European Europlug chargers often go straight into the combination wall socket. UK type G and Schuko type F plugs always need an adapter.",
    ],
    [
      "What voltage does China use?",
      "220 V at 50 Hz. Devices labelled 100-240V 50/60Hz — nearly every laptop, phone and camera charger — need only a shape adapter. A single-voltage 110 V or 120 V appliance from the US or Japan needs a step-down transformer, not an adapter.",
    ],
    [
      "Will a 230 V European appliance work in China?",
      "Yes, and it does not need a transformer. 220 V is only about 4% below 230 V, well inside the swing both supplies see anyway. The one visible effect is on purely resistive appliances: since power falls with the square of the voltage, a 2,000 W kettle rated at 230 V delivers roughly 1,830 W on 220 V, so it simply takes a little longer to boil.",
    ],
    [
      "Do Hong Kong and Macau use the same plugs as mainland China?",
      "No. Hong Kong uses the British BS 1363 type G socket with fused plugs, and Macau is mostly type G with older round-pin fittings still in service. Both run 220 V at 50 Hz like the mainland, so the voltage is fine — but a type I adapter bought for Beijing will not fit a Hong Kong wall socket.",
    ],
  ],
};

export default seo;
