const seo = {
  intro:
    "This calculator adds up the wattage of everything you plan to run from one travel power strip and converts it to the current that strip and wall socket must carry, using I = P / V at your destination's voltage. It compares the total against the lower of the two ratings — the strip's or the socket's — and against the 80% margin used for loads that run for hours, which is the US National Electrical Code's 125% continuous-load rule stated the other way round. The result is a plain answer on whether the kit fits one socket or needs splitting up.",
  useCases: [
    "Checking whether a laptop, two phone chargers and a travel kettle can share one hotel socket.",
    "Seeing why the same kit is comfortable on a 230 V European socket but marginal on a 120 V American one.",
    "Working out which single appliance to unplug when a 10 A strip is over its limit.",
  ],
  benefits: [
    ["Uses the binding limit", "Takes the lower of the socket and strip ratings, so a 16 A strip in a 10 A socket is treated as 10 A."],
    ["Separates the two ceilings", "Reports the 80% continuous-load figure and the full-rating figure instead of blurring them."],
    ["Voltage-aware", "The same watts draw roughly twice the current at 120 V as at 230 V, and the result says so."],
  ],
  faqs: [
    [
      "How many devices can I plug into one power strip?",
      "As many as fit, provided their combined current stays under the strip's rating — the count of sockets is not the limit, the current is. A 13 A strip on a 230 V supply carries about 2,990 W in total; a 15 A strip on a 120 V supply carries only about 1,800 W. Chargers use tens of watts, so a dozen of them are fine; one hair dryer can use the whole allowance on its own.",
    ],
    [
      "How do I convert watts to amps for a power strip?",
      "Divide watts by the supply voltage: amps = watts / volts. A 1,800 W hair dryer draws about 7.8 A on a 230 V supply but 15 A on a 120 V supply, which is why American and Japanese sockets trip so much more easily with the same appliance. Multiply back the other way to find the wattage a rating allows: 10 A at 230 V is 2,300 W.",
    ],
    [
      "What is the 80% rule for power strips?",
      "It is the continuous-load rule: where a load runs for three hours or more, the US National Electrical Code requires the circuit to be rated at least 125% of that load, which limits the continuous load to 80% of the rating. In practice that means treating a 10 A strip as 8 A for anything left running overnight, while a kettle that boils for two minutes can use the full rating.",
    ],
    [
      "Can I plug a hair dryer into a travel power strip?",
      "Usually only on its own. A full-size dryer is around 1,800 W, which is most or all of what a travel strip can carry, and travel strips tend to use thin flexible cord. Run heating appliances one at a time, straight into the wall where possible, and never on a cable reel that is still wound on its drum — a wound reel is de-rated to a small fraction of its unwound rating.",
    ],
  ],
};

export default seo;
