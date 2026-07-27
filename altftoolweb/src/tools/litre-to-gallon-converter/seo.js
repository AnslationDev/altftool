const seo = {
  intro:
    "This converter moves a volume between litres and both gallons using their exact legal definitions: the US liquid gallon is 231 cubic inches, which is 3.785411784 litres, and the imperial gallon is 4.54609 litres under the UK Weights and Measures Act 1985. Because the two differ by about 20%, a figure quoted in \"gallons\" means very different amounts in the US and the UK. It also converts a fuel price per litre into a price per gallon so cross-market comparisons are like for like.",
  useCases: [
    "Translate a 45 litre car tank into gallons when reading an American or British owner's manual.",
    "Compare a petrol price quoted per litre in India against a per-gallon price quoted in the US.",
    "Convert an imperial-gallon figure in an older British service manual into litres for a modern workshop.",
  ],
  benefits: [
    ["Both gallons, side by side", "US and imperial gallons shown together so the 20% gap is never missed."],
    ["Exact definitions", "Uses 3.785411784 L and 4.54609 L rather than rounded 3.79 and 4.55 factors."],
    ["Price per unit", "Turns a price per litre into price per US gallon and per imperial gallon automatically."],
  ],
  faqs: [
    [
      "How many litres are in a gallon?",
      "A US liquid gallon is 3.785411784 litres and an imperial (UK) gallon is 4.54609 litres. If a source does not say which gallon it means, check the country: the US, and most fuel pricing you see quoted in dollars, uses the smaller US gallon.",
    ],
    [
      "Why is the UK gallon bigger than the US gallon?",
      "They come from different definitions. The US kept the old English wine gallon of 231 cubic inches, while Britain redefined its gallon in 1824 as the volume of 10 pounds of water, later fixed at exactly 4.54609 litres. The imperial gallon is about 20.1% larger.",
    ],
    [
      "How do I convert litres to US gallons?",
      "Divide the litres by 3.785411784, or multiply by 0.264172. For example, 50 litres is 13.21 US gallons and 10.998 imperial gallons.",
    ],
    [
      "Is a US pint the same as an imperial pint?",
      "No. A US liquid pint is 473.18 mL and an imperial pint is 568.26 mL. The fluid ounce differs too: a US gallon holds 128 US fl oz while an imperial gallon holds 160 imperial fl oz, so the ounces themselves are 29.57 mL and 28.41 mL respectively.",
    ],
  ],
};

export default seo;
