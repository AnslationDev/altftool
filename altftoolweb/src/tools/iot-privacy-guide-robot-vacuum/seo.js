const seo = {
  title: "Robot Vacuum Privacy: Map, Camera and Cloud Audit",
  metaDescription:
    "Tick 15 weighted controls and the cloud toggles you leave on, then see which of seven data types — floor plan, camera frames, audio — leave your home.",
  steps: [
    "Under 'What leaves your home right now' tick the cloud features you have switched on — cloud maps, obstacle photo upload, remote live view, linked assistants, app location permission.",
    "Work through the 15 weighted controls grouped as Account and cloud, Mapping data, Cameras and sensors, and Network and lifecycle, ticking each control you have applied.",
    "Read the Privacy setup score with its band, held at 69% while a critical control is open, and the Household data footprint marking each data type 'Leaving the home' or 'Stays local'; press Copy result.",
  ],
  intro:
    "This guide scores a robot vacuum setup against fifteen weighted controls covering the app account, saved maps, camera and microphone features and end-of-life disposal, then models which categories of household data — floor plan, camera frames, audio, room labels, occupancy pattern, location and identity — leave the house because of the cloud features you leave switched on. The footprint model attributes each data type to the specific toggle driving it, so you can see which single setting is carrying the risk. It is for anyone whose vacuum has built a LIDAR map of their home and who wants to know where that map lives.",
  useCases: [
    "Deciding whether to keep cloud map sync switched on when only one floor is ever cleaned.",
    "Reviewing a camera-equipped model before letting it run in bedrooms or a home office with client paperwork.",
    "Clearing saved maps, linked assistants and old home members after moving house or changing the layout.",
    "Preparing a robot for resale so the previous home's map and Wi-Fi credentials do not travel with it.",
  ],
  benefits: [
    ["Attribution, not vague warnings", "Every exposed data type names the feature responsible, so you know what turning it off actually achieves."],
    ["Weighted checklist", "Account protection and image upload outrank cosmetic settings, and a missing critical control caps the score."],
    ["Covers disposal", "Factory reset, unlinking and deletion requests are treated as part of the setup, not an afterthought."],
  ],
  faqs: [
    [
      "Does my robot vacuum send a map of my house to the cloud?",
      "Most connected models do, because multi-floor memory, map sharing and voice-assistant integration all need a server-side copy. A LIDAR map records room dimensions, doorways and furniture positions, so check the app's map management and privacy screens for whether storage is on-device or in the account, and delete maps you no longer use.",
    ],
    [
      "Can a robot vacuum camera take pictures of me?",
      "Yes on camera-equipped models, and those frames can leave the house if obstacle-photo upload or a product-improvement programme is enabled. In 2022 images captured by development Roombas — including one of a person on a toilet — reached a third-party labelling workforce and then the open internet, through data sharing rather than a breach.",
    ],
    [
      "Have robot vacuums actually been hacked?",
      "Yes. At DEF CON in 2024 researchers demonstrated taking over Ecovacs models over Bluetooth and accessing the camera and microphone, and separate reports described stored maps and credentials remaining on devices. Keeping firmware current, disabling unused sensors and isolating the robot on a guest network are the practical defences.",
    ],
    [
      "What should I do before selling or giving away a robot vacuum?",
      "Factory reset the robot to clear stored maps and saved Wi-Fi credentials, then unlink it from your account in the app so the map does not remain in your cloud profile. Where the brand offers a data deletion request, submit that too, since a reset only clears the device.",
    ],
  ],
};

export default seo;
