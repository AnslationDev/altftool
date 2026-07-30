const seo = {
  metaDescription:
    "Screen possible aurora visibility at your latitude using NOAA's latest Kp index and a simple boundary estimate, with source timing and limitations.",
  intro:
    "The Aurora Visibility Forecast reads the latest planetary K-index from NOAA's Space Weather Prediction Center and compares your latitude against a simple visibility boundary of 67 degrees minus 2.2 times Kp — so at Kp 0 the screen sits near 67 degrees and at Kp 7 it drops to about 51.6 degrees. If your latitude is poleward of that line, conditions pass a first screening for possible aurora. It is a fast go / no-go check for aurora chasers and photographers deciding whether tonight is worth driving for, not a substitute for a full auroral oval forecast.",
  useCases: [
    "Deciding at 9pm in Edinburgh whether the current Kp is high enough to be worth a drive north of the city, before committing to the trip.",
    "Checking during a reported geomagnetic storm whether the boundary has actually dropped far enough south to reach your latitude, rather than trusting a social-media alert.",
    "Working out which of two possible shooting locations, several degrees of latitude apart, currently clears the screen.",
  ],
  benefits: [
    [
      "Reads the official Kp product directly",
      "The value comes from NOAA SWPC's planetary K-index feed each time you press for a reading, and the result shows the source timestamp in UTC so you can see how fresh it is.",
    ],
    [
      "Answers for your latitude, not a generic map",
      "You enter coordinates or use device location, and the screen compares your absolute latitude against the computed boundary, so a yes or no applies to where you actually are.",
    ],
    [
      "Shows its working",
      "The result lists the Kp value, your latitude and the boundary figure side by side, so you can see how close a marginal call was instead of getting an unexplained verdict.",
    ],
  ],
  faqs: [
    [
      "What Kp do I need to see the aurora from where I am?",
      "Rearrange the screen: you need a Kp of roughly (67 minus your latitude) divided by 2.2. At 55 degrees that is about Kp 5.5; at 60 degrees about Kp 3.2; at 50 degrees about Kp 7.7. Higher Kp pushes the auroral oval further towards the equator.",
    ],
    [
      "What is the Kp index?",
      "Kp is a planetary geomagnetic activity index on a 0 to 9 scale, derived from magnetometer readings at a network of ground observatories and published in three-hour intervals. NOAA's G-scale for geomagnetic storms starts at Kp 5 (G1) and reaches G5 at Kp 9.",
    ],
    [
      "Does passing the screen mean I will actually see the aurora?",
      "No. This is a latitude-and-Kp screen only. Darkness, cloud cover, moonlight, light pollution, your local horizon to the north, and the difference between geographic and geomagnetic latitude all matter, and any one of them can rule out a night that clears the boundary.",
    ],
    [
      "How current is the reading?",
      "It is fetched on demand when you request a result, and the row labelled Latest UTC shows the timestamp NOAA attached to that Kp value. Kp is reported in three-hour periods, so a value can be up to a few hours old even when the fetch is instant.",
    ],
  ],
};

export default seo;
