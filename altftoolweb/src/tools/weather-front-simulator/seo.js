const seo = {
  intro:
    "Weather Front Simulator draws an animated atmospheric cross-section of the four frontal boundaries — cold, warm, stationary and occluded — showing how the colder, denser air mass sits against the warmer one and what that geometry does to cloud and rain. Each front comes with its reference card: expected weather, the cloud sequence to look for, and the barometric pressure signature, alongside sliders for temperature contrast (5–30 °C) and air moisture (20–100%). It is a teaching illustration for geography and earth-science students learning why a cold front brings a short violent burst and a warm front brings hours of steady drizzle.",
  useCases: [
    "You are revising for a geography exam and need to fix in your head which front produces cumulonimbus and which produces the cirrus-to-nimbostratus progression",
    "A teacher wants a moving cross-section on the board while explaining why the cold air wedges underneath rather than mixing with the warm air",
    "You watched the barometer fall all morning and want to check which frontal pressure signature matches what you are seeing outside",
  ],
  benefits: [
    [
      "Geometry is the point, and it is visible",
      "The cold-front wedge is drawn steep and the warm-front boundary shallow, which is the single fact that explains the difference in storm intensity and duration.",
    ],
    [
      "Each front carries its own forecast card",
      "Cloud types, precipitation character and pressure behaviour are listed per front, so the picture and the symptoms you would actually observe stay next to each other.",
    ],
    [
      "Animation you can pause",
      "The airflow runs continuously but stops on demand, so a class can freeze the frame at the moment of lift and talk through the condensation step.",
    ],
  ],
  faqs: [
    [
      "What is the difference between a cold front and a warm front?",
      "A cold front is dense cold air pushing under warmer air along a steep boundary — typically around a 1:50 to 1:100 slope — which forces rapid vertical lift, cumulonimbus towers, heavy showers or thunderstorms and a sharp pressure rise once it passes. A warm front is warm air riding up over retreating cold air on a much shallower slope, nearer 1:100 to 1:200, giving a long cirrus-to-altostratus-to-nimbostratus cloud sequence and hours of light steady rain ahead of it.",
    ],
    [
      "Why does lifting air produce clouds?",
      "Because rising air expands into lower pressure and cools without exchanging heat with its surroundings — roughly 9.8 °C per kilometre while it stays unsaturated. When it cools to its dew point the water vapour it carries condenses onto particles and becomes cloud; beyond that the release of latent heat slows the cooling to around 5–6 °C per kilometre.",
    ],
    [
      "What is an occluded front?",
      "It is what forms when a faster-moving cold front catches up to the warm front ahead of it and lifts the warm air completely clear of the ground. The surface then has cold air on both sides of the boundary with the warm sector trapped aloft, which is why occlusions bring mixed nimbostratus and cumulonimbus cloud and mark the point where a mid-latitude depression starts to decay.",
    ],
    [
      "Can I use this to forecast my local weather?",
      "No — it is an illustrative cross-section of frontal structure, not a numerical weather model, and it takes no observations of your location. Use it to understand what a front is doing, then check your national meteorological service for an actual forecast or warning.",
    ],
  ],
};

export default seo;
