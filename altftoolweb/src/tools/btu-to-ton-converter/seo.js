const seo = {
  intro:
    "A ton of refrigeration is defined as 12,000 BTU per hour — the rate needed to melt one short ton of ice in 24 hours — which this converter uses to move a cooling capacity between tons, BTU/h, watts, kilowatts and kcal/h. Because the International Table BTU is exactly 1,055.05585262 J, one ton works out to 3,516.85 W or 3,024 kcal/h. It also divides capacity by COP to show the electrical input the same machine would draw, since capacity is heat moved and not power consumed.",
  useCases: [
    "Read an imported air conditioner rated 18,000 BTU/h and confirm it is the 1.5 ton size sold locally.",
    "Convert a chiller schedule written in kW of cooling into the tons the vendor quotes.",
    "Estimate the electrical load a 3 ton system adds to a panel before sizing the breaker and cable.",
  ],
  benefits: [
    ["Exact definitions", "12,000 BTU/h per ton and 1,055.05585262 J per BTU, so the watts figure is precise."],
    ["kcal/h included", "The unit still printed on many Indian and Gulf datasheets, converted alongside the rest."],
    ["Capacity versus consumption", "Separates cooling output from electrical input using COP, and shows the matching EER."],
  ],
  faqs: [
    [
      "How many BTU is 1 ton of AC?",
      "12,000 BTU per hour. That is 3,516.85 watts of cooling or 3,024 kcal/h. A 1.5 ton split is therefore rated 18,000 BTU/h and a 2 ton unit 24,000 BTU/h.",
    ],
    [
      "Is a 1.5 ton AC 1.5 kW?",
      "No — those are different quantities. A 1.5 ton unit removes about 5.28 kW of heat, but it draws far less electricity, typically 1.3 to 1.6 kW at a COP around 3.3 to 4. Capacity is heat moved; the electricity bill follows the input power.",
    ],
    [
      "What is the difference between EER and COP?",
      "Both compare cooling output with electrical input; they only differ in units. COP is watts of cooling per watt of input, EER is BTU/h of cooling per watt of input, so EER equals COP multiplied by 3.4121. A COP of 3.5 is an EER of 11.94.",
    ],
    [
      "Why is a cooling ton called a ton?",
      "It dates from ice-based cooling. Melting one short ton (2,000 lb) of ice absorbs 2,000 x 144 = 288,000 BTU, and spreading that over 24 hours gives 12,000 BTU per hour. The name stuck even though modern systems use no ice.",
    ],
  ],
};

export default seo;
