const seo = {
  title: "Voltage Stabilizer Selector: kVA and Working Range",
  metaDescription:
    "Sizes a stabilizer from watts, power factor and surge margin, then finds the narrowest working range clearing your voltage swing by 5 V.",
  steps: [
    "Pick the load under Appliance — presets run from \"Air conditioner — 1.5 ton\" and \"Refrigerator — up to 300 L\" to \"LED TV — 55 to 65 in\" and \"Water heater / geyser\" — or choose Custom appliance and type your own Running power (W) and Power factor.",
    "Set the Safety margin (x load VA), 2x for anything with a compressor or motor and 1.25x for electronics, then enter the Lowest supply voltage (V) and Highest supply voltage (V) you measured at the socket.",
    "\"Buy this stabilizer\" names the kVA size and its working range, the list beneath gives load VA, required capacity with margin, spare capacity, output current at 230 V, input current at your lowest voltage and the +/-6% statutory band, and \"Working ranges on the market\" marks each range Yes or No against your swing before Copy result copies the lot.",
  ],
  intro:
    "This selector sizes a domestic voltage stabilizer two ways at once: capacity, from load VA = running watts / power factor multiplied by a surge margin (2x for compressor loads, 1.25x for electronics) and rounded up to the next standard rating, and working range, by finding the narrowest off-the-shelf input range that clears your site's lowest and highest measured voltage with a 5 V buffer. It exists because most stabilizers are bought on kVA alone and then cut off during an evening dip, which is a range problem, not a capacity one. Aimed at homeowners buying for an air conditioner, refrigerator or television.",
  useCases: [
    "Choosing between a 3 kVA and 4 kVA stabilizer for a 1.5 ton split air conditioner",
    "Finding out whether a 150–280 V range is enough when the supply drops to 165 V in summer evenings",
    "Deciding if a fridge on a 500 VA stabilizer is properly covered once compressor in-rush is counted",
  ],
  benefits: [
    ["Range, not just kVA", "Checks every common working range against the voltage swing you actually measured."],
    ["Surge accounted for", "Applies a 2x margin to compressor loads, which is why a 1500 W AC needs 4 kVA."],
    ["Input current shown", "Tells you the amps the stabilizer pulls from the wall while boosting from a low supply."],
  ],
  faqs: [
    [
      "Which stabilizer is best for a 1.5 ton AC?",
      "A 4 kVA unit. A 1500 W compressor at 0.85 power factor is about 1765 VA, and doubling that for start-up in-rush gives roughly 3530 VA, so the next standard size up is 4 kVA. Match the working range to your supply — 150–280 V suits most homes, 130–290 V if evening voltage falls below 155 V.",
    ],
    [
      "What working range should a voltage stabilizer have?",
      "One that covers your lowest and highest measured voltage with about 5 V to spare at each end. Measure with a multimeter at peak evening hours for a few days; if the reading stays inside 175–265 V a 170–270 V relay unit is enough, and anything below 155 V calls for a 130–290 V or servo model.",
    ],
    [
      "Do I need a stabilizer for a modern inverter AC?",
      "Often not — most inverter ACs sold today carry built-in wide-voltage protection, commonly quoted around 145–290 V, and the manufacturer states it in the manual. Fit a stabilizer only if your supply leaves that band or the warranty terms require one.",
    ],
    [
      "How many watts can a 5 kVA stabilizer handle?",
      "About 4250 W at 0.85 power factor, or the full 5000 W on a purely resistive load like a geyser, since kVA is apparent power and watts are real power. Always size on VA, not watts, and leave the surge margin in place for motor loads.",
    ],
  ],
};

export default seo;
