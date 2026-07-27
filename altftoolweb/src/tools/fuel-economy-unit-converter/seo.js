const seo = {
  intro:
    "This converter moves a fuel economy figure between kilometres per litre, litres per 100 km, miles per US gallon and miles per imperial gallon. Distance-per-volume and volume-per-distance units are reciprocals of each other, so l/100 km = 100 ÷ km/l, while the mpg figures scale by the gallon in use: 3.785411784 litres for the US gallon and 4.54609 litres for the imperial one. Enter one number and a trip distance to see every equivalent plus the litres and gallons the journey would take.",
  useCases: [
    "Reading a US road-test mpg figure when your own car's economy is quoted in km/l.",
    "Comparing a European l/100 km rating with an Indian ARAI km/l rating before booking a hire car.",
    "Working out how many litres a 600 km drive needs so you know how many fill-ups to budget for.",
  ],
  benefits: [
    ["Both gallons handled", "US and imperial mpg shown separately, so a 40 mpg UK car is not mistaken for a 40 mpg US one."],
    ["Reciprocal maths done right", "Handles the direction flip between km/l and l/100 km that trips up quick mental conversions."],
    ["Trip fuel included", "Turns the economy into the actual litres and gallons a given distance consumes."],
  ],
  faqs: [
    [
      "How do I convert km/l to litres per 100 km?",
      "Divide 100 by the km/l figure: 15 km/l is 100 ÷ 15 = 6.67 l/100 km. The relationship is a reciprocal, not a scaling, so improvements at the efficient end matter less than they look — going from 20 to 25 km/l saves 1 litre per 100 km, while going from 5 to 6 km/l saves 3.3.",
    ],
    [
      "What is 30 mpg in km/l?",
      "12.75 km/l if that is 30 miles per US gallon, or 10.62 km/l if it is 30 miles per imperial gallon. The conversion factors are 1 km/l = 2.352 US mpg and 1 km/l = 2.825 imperial mpg.",
    ],
    [
      "Why is UK mpg higher than US mpg for the same car?",
      "Because the imperial gallon is 4.54609 litres against the US gallon's 3.785411784 — about 20% larger — so the same car travels about 20% further on one. A car rated 40 mpg in the UK is roughly 33 mpg in the US, and the two figures are never directly comparable.",
    ],
    [
      "Is a lower or higher number better?",
      "Higher is better for km/l and mpg because they measure distance covered per unit of fuel; lower is better for l/100 km because it measures fuel burned per fixed distance. Europe uses l/100 km partly because it scales linearly with fuel cost, which distance-per-volume units do not.",
    ],
  ],
};

export default seo;
