const seo = {
  title: "Firewood Cord Calculator: Species, Stove Efficiency",
  metaDescription:
    "Cords needed for a season from your species (13 to 32.9 MMBtu a cord) and stove efficiency, plus face cords, seasoned weight and stack length.",
  steps: [
    "Under Work it out from choose Heat I need for the season and give the figure with a Heat unit of MMBtu, kWh or GJ - or choose How much I actually burn and give Burning hours per day, Heating season (days) and Burn rate (kg of wood per hour).",
    "Pick Wood species and Burning appliance from the lists, which show MMBtu per cord and efficiency, then set Log length / stack depth (inches), Stack height (feet) and Delivered price per full cord.",
    "Read Firewood needed in full cords with the Face cords, Stacked volume, Seasoned weight, Stack length and Cost per delivered MMBtu rows, then press Copy result.",
  ],
  intro:
    "This calculator works out how many cords of firewood a heating season needs, dividing the heat you must deliver by the heat content of a cord of your chosen species and the efficiency of your stove or fireplace. A full cord is the legal 128 cubic feet — a stack 4 ft high, 4 ft deep and 8 ft long — and species heat values are the published extension-service figures for wood seasoned to 20% moisture, from about 13 MMBtu per cord for cedar to 32.9 for osage orange. It also returns face cords at your log length, seasoned weight, stack length and cost per delivered MMBtu.",
  useCases: [
    "Checking whether three cords of red oak will cover a season before paying for a delivery",
    "Comparing a seller's face-cord price against a full-cord price at a given log length",
    "Working out how much wall or fence line a season's wood will occupy when stacked 4 ft high",
  ],
  benefits: [
    [
      "Species matters most",
      "A cord of osage orange carries more than twice the heat of a cord of cedar, so the species you burn changes the volume needed dramatically.",
    ],
    [
      "Efficiency applied honestly",
      "An open fireplace delivers around 12% of the wood's heat against 70-80% for a certified stove — a six-fold difference in wood consumed.",
    ],
    [
      "Face cords resolved",
      "Converts between full cords and face cords at your actual log length, which is where most firewood pricing disputes start.",
    ],
  ],
  faqs: [
    [
      "How many cords of wood do I need for a winter?",
      "Three to five full cords is typical for a home heated mainly by a certified wood stove in a cold climate. As a worked example, 60 MMBtu of delivered heat from red oak at 24 MMBtu per cord through a 70%-efficient non-catalytic stove needs about 3.6 cords; the same demand through an open fireplace at 12% efficiency would need nearly 21.",
    ],
    [
      "What is the difference between a cord and a face cord?",
      "A full cord is 128 cubic feet stacked 4 × 4 × 8 ft. A face cord is 4 ft high and 8 ft long but only as deep as the logs are long, so with 16-inch logs it is a third of a full cord and with 24-inch logs it is half. Always confirm the log length before comparing face-cord prices.",
    ],
    [
      "How much does a cord of firewood weigh?",
      "Between roughly 2,300 lb for aspen and 5,100 lb for osage orange when seasoned to 20% moisture. Weight tracks heat content almost exactly, because oven-dry wood of every species releases close to the same energy per pound — about 6,400 BTU per pound at 20% moisture.",
    ],
    [
      "Which firewood gives the most heat per cord?",
      "Osage orange leads at about 32.9 million BTU per cord, followed by shagbark hickory at 27.7 and white oak at 26.4. Softwoods sit far lower — white pine at 15.9 and cedar at 13.0 — so you burn roughly twice the volume for the same heat, though they light easily and are useful for shoulder-season fires.",
    ],
  ],
};

export default seo;
