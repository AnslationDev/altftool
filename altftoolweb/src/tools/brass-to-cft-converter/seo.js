const seo = {
  title: "Brass to CFT Converter: Cubic Feet, m3, Tonnes, Trips",
  metaDescription:
    "1 brass = 100 cubic feet. Enter brass, cft, m3 or tonnes with a loose bulk density to get the rest, plus tipper trips for sand or aggregate.",
  steps: [
    "Enter the Quantity and set Unit of that quantity to Brass, Cubic feet (cft), Cubic metres (m3) or Tonnes.",
    "Pick a Material such as River sand (dry, loose) to fill Loose bulk density (kg/m3), which stays editable, then set Truck capacity (brass per trip) or tap a preset like Tipper (10-wheel).",
    "In cubic feet leads the result with the brass figure and tonnes underneath, plus trip counts and an optional cost from Delivered rate per brass; Copy result saves it.",
  ],
  intro:
    "A brass is 100 cubic feet of loose construction material, so this converter multiplies or divides by 100 to move between brass and cft, then applies the exact foot definition (1 ft = 0.3048 m, so 1 cft = 0.028316846592 m3) to reach cubic metres. Weight comes from the loose bulk density you pick — river sand near 1,600 kg/m3, 20 mm aggregate near 1,500 kg/m3 — which makes one brass of sand roughly 4.53 tonnes. It is built for site engineers, contractors and homeowners checking a sand or aggregate invoice.",
  useCases: [
    "Check whether a tipper that billed you 3 brass actually delivered 300 cft by measuring the heap.",
    "Convert a bill of quantities written in cubic metres into the brass figure your supplier quotes.",
    "Work out how many tonnes a weighbridge slip should show for the brass of aggregate you ordered.",
  ],
  benefits: [
    ["Exact volume maths", "Uses the defined 0.3048 m foot, so cft to m3 is precise rather than rounded to 0.0283."],
    ["Weight from real densities", "Loose bulk densities for sand, M-sand, stone dust and 10/20/40 mm aggregate, each editable."],
    ["Truckloads, not just numbers", "Converts the volume into trips for tractor trolleys and 2 to 6 brass tippers."],
  ],
  faqs: [
    [
      "How many cft is 1 brass?",
      "One brass is 100 cubic feet. It is a volume unit used across Maharashtra, Gujarat and neighbouring states for loose material, and it equals 2.8317 cubic metres.",
    ],
    [
      "How many tonnes is 1 brass of sand?",
      "About 4.5 tonnes. One brass is 2.8317 m3, and dry loose river sand has a bulk density near 1,600 kg/m3, giving 4,531 kg. M-sand at about 1,750 kg/m3 works out closer to 4.96 tonnes per brass.",
    ],
    [
      "Is brass a unit of area or volume?",
      "Both, and the context decides. For sand, aggregate and excavation it means 100 cubic feet of volume; for plastering, tiling and shuttering it means 100 square feet of area. This converter handles the volume meaning.",
    ],
    [
      "Why does my delivered sand measure more volume than the weight suggests?",
      "Moisture makes sand bulk. Water films push the grains apart, so damp sand can occupy 15-25% more volume than the same weight of dry sand, peaking around 5-8% moisture content. Measure the truck body dimensions and agree the billing basis — volume or weighbridge weight — before delivery.",
    ],
  ],
};

export default seo;
