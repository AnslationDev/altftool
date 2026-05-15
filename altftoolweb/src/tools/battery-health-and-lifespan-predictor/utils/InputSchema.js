export const inputSchema = {
  mobile: [
    { key: "age", label: "Device Age (months)", type: "number", tooltip: "How many months since you started using the device." },
    { key: "usage", label: "Daily Screen Time (hrs)", type: "number", tooltip: "Average hours per day the screen is on." },
    {
      key: "heat",
      label: "Heat Exposure",
      type: "select",
      options: ["low", "medium", "high"],
      tooltip: "Does the device often feel hot during usage?",
    },
    {
      key: "usageStyle",
      label: "Usage Style",
      type: "select",
      options: ["Light (browsing, calls)", "Moderate (social media, video)", "Heavy (gaming, streaming)"],
      tooltip: "Type of apps you use most.",
    },
    {
      key: "chargingFrequencyType",
      label: "Charging Frequency",
      type: "select",
      options: ["Daily", "Weekly", "Irregular"],
      tooltip: "How often do you charge?",
      conditional: {
        Daily: {
          key: "dailyFrequency",
          label: "Times per day",
          type: "select",
          options: ["Once", "Twice", "Three times"],
          tooltip: "How many times a day do you charge?",
        },
        Weekly: {
          key: "weeklyFrequency",
          label: "Times per week",
          type: "select",
          options: ["Once", "Twice", "3+ times"],
          tooltip: "How many times a week?",
        },
      },
    },
    {
      key: "chargingStyle",
      label: "Charging Style",
      type: "select",
      options: ["Balanced (20-80%)", "Frequent Top-up", "Full Cycle (0-100%)"],
      tooltip: "Do you top up frequently or do full cycles?",
    },
    {
      key: "fastChargingPercent",
      label: "Fast Charging Usage",
      type: "select",
      options: ["Never", "Occasionally", "Frequently"],
      tooltip: "How often do you use a fast charger?",
    },
    {
      key: "drainBelow20",
      label: "Battery drain below 20%",
      type: "select",
      options: ["never", "rarely", "often"],
      tooltip: "How often do you let the battery drop below 20%?",
    },
    {
      key: "overnightCharging",
      label: "Overnight Charging",
      type: "select",
      options: ["no", "yes"],
      tooltip: "Do you leave it plugged in overnight?",
    },
  ],

  laptop: [
    { key: "age", label: "Laptop Age (months)", type: "number", tooltip: "Months since purchase." },
    { key: "usage", label: "Daily Usage (hrs)", type: "number", tooltip: "Average hours of active use per day." },
    { key: "heat", label: "Heat Level", type: "select", options: ["cool", "warm", "hot"], tooltip: "Typical bottom surface temperature." },
    { key: "workload", label: "Workload Type", type: "select", options: ["Light", "Moderate", "Heavy"], tooltip: "Typical CPU/GPU load." },
    {
      key: "pluggedRatio",
      label: "Plugged‑in Usage",
      type: "select",
      options: [
        "Always plugged in",
        "Mostly plugged in",
        "Sometimes on battery",
        "Mostly on battery",
      ],
      tooltip: "How often is the laptop connected to the charger?",
    },
    {
      key: "chargeCyclesPerWeek",
      label: "Charging Cycles per Week",
      type: "select",
      options: [
        "Less than once a week",
        "1-2 times a week",
        "3-4 times a week",
        "5-7 times a week",
        "Multiple times a day",
      ],
      tooltip: "How often do you fully discharge and recharge?",
    },
    { key: "thermalThrottling", label: "Thermal Throttling", type: "select", options: ["rare", "occasional", "frequent"], tooltip: "How often does the laptop throttle due to heat?" },
    { key: "gamingRender", label: "Gaming / Render Usage", type: "select", options: ["no", "light", "heavy"], tooltip: "Do you regularly game or render?" },
  ],

  ev: [
    { key: "age", label: "Vehicle Age (months)", type: "number", tooltip: "Months since delivery." },
    { key: "usage", label: "Daily Distance (km)", type: "number", tooltip: "Average kilometres driven per day." },
    { key: "heat", label: "Heat Exposure", type: "select", options: ["low", "medium", "high"], tooltip: "How hot does the battery area get?" },
    {
      key: "drivingStyle",
      label: "Your Driving Style",
      type: "select",
      options: [
        "Eco (gentle acceleration, low speeds)",
        "Normal (balanced driving)",
        "Sport (hard acceleration, high speeds)"
      ],
      tooltip: "How you typically accelerate and drive.",
    },
    {
      key: "fastChargingUsage",
      label: "Fast Charging Usage",
      type: "select",
      options: [
        "Never",
        "Rarely (road trips only)",
        "Sometimes (a few times a month)",
        "Frequently (weekly)",
        "Almost always"
      ],
      tooltip: "How often do you use DC fast charging?",
    },
    {
      key: "chargingDepth",
      label: "Charging Depth Habit",
      type: "select",
      options: [
        "Always charge to 100%",
        "Daily to 80-90%, 100% for long trips",
        "Strictly keep between 20-80%",
        "Usually charge to 100%, but occasionally top-up"
      ],
      tooltip: "What's your typical charging routine?",
    },
    {
      key: "temperatureRange",
      label: "Typical Battery Temperature",
      type: "select",
      options: [
        "Cold (below 10°C)",
        "Mild (10–25°C)",
        "Warm (25–35°C)",
        "Hot (above 35°C)"
      ],
      tooltip: "The temperature range the battery operates in most of the time.",
    },
    { key: "regenBraking", label: "Regenerative Braking Usage", type: "select", options: ["low", "medium", "high"], tooltip: "How much do you rely on regen braking?" },
    {
      key: "idleStorageDaysPerMonth",
      label: "Idle Storage (days per month)",
      type: "select",
      options: [
        "0 days (never idle)",
        "1–3 days",
        "4–7 days",
        "8–14 days",
        "15+ days"
      ],
      tooltip: "How many days per month does the vehicle sit unused?",
    },
  ],

  misc: [
    { key: "age", label: "Device Age (months)", type: "number", tooltip: "Months in service." },
    { key: "usage", label: "Daily Usage (hrs)", type: "number", tooltip: "Average daily runtime." },
    { key: "heat", label: "Environment", type: "select", options: ["cool", "normal", "hot"], tooltip: "Ambient temperature." },
    {
      key: "chargeCyclesPerWeek",
      label: "Charge/Discharge Cycles per Week",
      type: "select",
      options: [
        "Less than once a week",
        "1-2 times a week",
        "3-4 times a week",
        "5-7 times a week",
        "Multiple times a day",
      ],
      tooltip: "How often does the device complete a full cycle?",
    },
    { key: "loadStability", label: "Load Stability", type: "select", options: ["stable", "moderate", "unstable"] },
    { key: "cycleStability", label: "Cycle Stability", type: "select", options: ["regular", "irregular"] },
    { key: "storageIdleMonths", label: "Storage Idle Time (months)", type: "number", tooltip: "Months the device sat unused?" },
    { key: "usageIntensitySpikes", label: "Usage Intensity Spikes", type: "select", options: ["low", "medium", "high"] },
  ],
};