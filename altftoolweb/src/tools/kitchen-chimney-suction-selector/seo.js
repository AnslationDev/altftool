const seo = {
  title: "Kitchen Chimney Suction Calculator with Duct Loss",
  metaDescription:
    "Kitchen volume x 10-15 air changes, plus burner and layout allowances, divided by duct efficiency: the m³/h to shop for and the chimney width.",
  steps: [
    "Enter Kitchen length (m), Kitchen width (m) and Ceiling height (m), then pick How heavily you cook.",
    "Set Burners on the hob, Kitchen layout and Venting, and for a ducted hood add Duct length (m) and 90° bends in the duct.",
    "Read Suction to shop for in m³/h, the Duct efficiency percentage lost to the pipe run, and the Chimney width, then press Copy result.",
  ],
  intro:
    "Chimney suction is sized from air changes: airflow in cubic metres per hour equals kitchen volume multiplied by the air changes per hour it needs, which is 10 for light cooking and 15 for daily frying and tempering. This tool applies that, adds capture allowances for the number of burners and for an open-plan layout, then divides by duct efficiency — because the m3/h printed on a chimney is free-air delivery measured with no duct attached, and every metre of pipe and every 90 degree bend takes a slice of it. The output is the rating to shop for and the chimney width that matches your hob.",
  useCases: [
    "Decide between a 1,000 and a 1,200 m3/h chimney for a 10 x 12 ft kitchen with daily frying.",
    "See how much extra suction an open-plan kitchen needs compared with a closed one.",
    "Understand why a chimney rated 1,200 m3/h underperforms on an eight-metre duct with three bends.",
  ],
  benefits: [
    ["Volume-based, not marketing-based", "Starts from your kitchen's cubic metres and a stated air-change rate you can check."],
    ["Duct losses made explicit", "Shows the percentage the pipe run costs, which is the usual reason a chimney disappoints."],
    ["Width and mounting height too", "Confirms the chimney is at least as wide as the hob and gives the 65-75 cm installation window."],
  ],
  faqs: [
    [
      "How much suction do I need for an Indian kitchen?",
      "Work out kitchen volume in cubic metres and multiply by 10 to 15 air changes an hour — use 15 for daily deep frying and tadka. A typical 3.6 x 3 x 3 m kitchen is 32.4 cubic metres, so 15 air changes is 486 m3/h, and with a four-burner hob, a three-metre duct and quiet-running headroom that lands near 1,100 m3/h of rated suction.",
    ],
    [
      "Is 1200 m3/h chimney enough?",
      "For most closed kitchens up to about 35 cubic metres with a short duct, yes. It stops being enough when the kitchen is open plan, the ceiling is high, or the duct runs more than five metres with multiple bends — each bend costs roughly 7% of the flow and each metre about 4%.",
    ],
    [
      "What size chimney for a 3 burner or 4 burner hob?",
      "Match the width first: a chimney must be at least as wide as the hob, so 60 cm for a 2 or 3 burner and 90 cm for most 4 and 5 burner hobs. More burners running together also need more airflow, which is why the calculation adds about 15% for a four-burner hob over a two-burner one.",
    ],
    [
      "How high should a kitchen chimney be installed above the hob?",
      "65 to 75 cm above the cooktop for most models. Mount it lower and the flame is disturbed and the filter gets hot; mount it higher and the plume spreads before it is captured, so the same suction rating performs worse. Always follow the height stated in the model's manual.",
    ],
  ],
};

export default seo;
