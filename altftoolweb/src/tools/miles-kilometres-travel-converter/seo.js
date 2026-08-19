const seo = {
  title: "Miles to Km Converter: Road Trips & Speed Limits",
  metaDescription:
    "Convert road distances and speed limits between miles and km with the exact 1.609344 factor, plus driving time at that speed and a posted-limit table.",
  steps: [
    "Enter the 'Trip distance' and 'Speed limit or cruising speed', choosing Miles or Kilometres and 'Miles per hour' or 'Kilometres per hour' in the two unit selects.",
    "The conversion recalculates as you type using 1 mile = 1.609344 km exactly, listing the distance in miles, kilometres and metres, the speed in mph, km/h and m/s, and 'Driving time at that steady speed'.",
    "Press 'Copy result' for the text summary or 'Reset' for the 250 mi at 70 mph example; the 'Speed limits you will meet' table shows typical posted limits in both units.",
  ],
  intro:
    "This converter turns road distances and posted speed limits between miles and kilometres using the exact factor 1 mile = 1.609344 km, fixed by the 1959 international yard and pound agreement. It is aimed at drivers hiring a car in a country that signs the other unit, and it also returns the driving time for the distance at the speed you enter, so a 250 mile leg at 70 mph reads as 402.34 km at 112.7 km/h in about 3 h 34 min.",
  useCases: [
    "Reading a 130 km/h autoroute sign in France when your instinct is calibrated in mph.",
    "Checking whether a 500 km drive between two cities is a day trip or an overnight stop.",
    "Converting a rental car's kilometre allowance into the miles you actually plan to drive.",
  ],
  benefits: [
    ["Exact conversion factor", "Uses 1.609344 rather than the rough 1.6, so long distances do not drift."],
    ["Distance and speed together", "Convert the leg and the limit in one screen, then get the driving time from both."],
    ["Posted-limit reference", "Common built-up, rural and motorway limits shown in both units for quick recognition."],
  ],
  faqs: [
    [
      "How many kilometres is 1 mile?",
      "Exactly 1.609344 kilometres. That value is definitional rather than measured: the 1959 international yard and pound agreement fixed the yard at 0.9144 m, and a statute mile is 1,760 yards, giving 1,609.344 m.",
    ],
    [
      "What is 70 mph in km/h?",
      "112.65 km/h, which is why UK motorway signs read 70 while comparable European motorways post 110, 120 or 130 km/h. Other common pairs: 30 mph is 48 km/h, 50 mph is 80 km/h and 65 mph is 105 km/h.",
    ],
    [
      "How do I convert miles to kilometres in my head?",
      "Multiply by 8 and divide by 5, or add half again plus a tenth — 60 miles becomes 60 + 30 + 6 = 96 km against a true 96.6. The Fibonacci trick also works because consecutive Fibonacci numbers approximate the ratio: 5 miles is about 8 km, 8 miles about 13 km, 13 miles about 21 km.",
    ],
    [
      "Does the conversion differ for nautical miles?",
      "Yes. A nautical mile is 1,852 m exactly — about 15% longer than a statute mile — and is used for sea and air navigation, where speed is measured in knots (one nautical mile per hour). Road distances and car speedometers always use the statute mile, which is what this converter applies.",
    ],
  ],
};

export default seo;
