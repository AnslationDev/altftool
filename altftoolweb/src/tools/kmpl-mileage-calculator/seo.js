const seo = {
  title: "KMPL Mileage Calculator – Tank-to-Tank km/l & mpg",
  metaDescription:
    "Log brim-to-brim fill-ups (odometer + litres) to measure true km/l, l/100 km, US/UK mpg and fuel cost per km — averaged across tanks, not estimated.",
  steps: [
    "In the Fill-up log, enter the Baseline odometer (km), then each brim-to-brim refill's odometer and Litres filled — press Add fill for more tanks and set the Fuel price (per litre).",
    "The calculator divides the distance between fills by the litres dispensed — the baseline fill's litres are not counted — and averages every tank into one True mileage figure.",
    "Read the km/l result with Consumption in litres / 100 km, US and UK mpg, Fuel cost per km and Best tank / Worst tank rows, then press Copy result to copy the summary.",
  ],
  intro:
    "This calculator measures real fuel efficiency with the tank-to-tank (brim-to-brim) method: mileage in km/l is the distance between two full-to-the-brim fills divided by the litres it took to refill. It ignores the litres in the first fill, because those replaced fuel burnt before the measurement began, and it averages several tanks so one generous or stingy fill does not skew the answer. Results are also shown as litres per 100 km, US mpg, imperial mpg and fuel cost per kilometre.",
  useCases: [
    "Checking whether your car really returns the mileage the trip computer claims",
    "Measuring the mileage gain after a service, new tyres or a switch to correct tyre pressure",
    "Building a real km/l figure to quote when selling a used car or bike",
  ],
  benefits: [
    ["Measures, does not estimate", "Uses litres actually dispensed, so it cannot be optimistic like a dashboard readout."],
    ["Multi-tank averaging", "Log several fills to smooth out differences in how full the tank was brimmed."],
    ["All the units at once", "km/l, l/100 km, US mpg, UK mpg and cost per km from the same readings."],
  ],
  faqs: [
    [
      "How do I calculate km/l accurately?",
      "Fill the tank to the brim, note the odometer, drive normally, then brim it again and divide the distance covered by the litres dispensed. 430 km on a 28.5-litre refill is 430 ÷ 28.5 = 15.09 km/l.",
    ],
    [
      "Why don't I count the litres in the first fill?",
      "That first fill replaces fuel you burnt before the measurement started, so counting it would mix in an unknown distance. Only litres dispensed at the end of a measured stretch belong in the division.",
    ],
    [
      "How do I convert km/l to mpg?",
      "Multiply km/l by 2.352 for US mpg and by 2.825 for imperial mpg, because a US gallon is 3.785 litres and a UK gallon is 4.546 litres, with a mile at 1.609344 km. So 15 km/l is 35.3 US mpg or 42.4 UK mpg.",
    ],
    [
      "Why is my measured mileage lower than the manufacturer's figure?",
      "Certified figures come from a standard test cycle at controlled speeds, load and temperature. Real driving adds traffic, air conditioning, roof loads, tyre pressure below spec and short cold trips, and a 15-25% shortfall against the claimed figure is normal.",
    ],
  ],
};

export default seo;
