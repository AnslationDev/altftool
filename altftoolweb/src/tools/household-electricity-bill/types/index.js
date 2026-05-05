export const RoomCategory = ["Kitchen", "Bedroom", "Hall", "Bathroom", "Outdoor", "Other"];

export const ApplianceIconKey = [
  "ac",
  "fridge",
  "fan",
  "tv",
  "cooler",
  "washing",
  "laptop",
  "microwave",
  "geyser",
  "lights",
  "custom",
];

export const Appliance = {
  id: "",
  name: "",
  wattage: 0,
  quantity: 1,
  hoursPerDay: 0,
  roomCategory: RoomCategory[0],
  iconKey: ApplianceIconKey.at(-1),
};

export const ApplianceTemplate = {
  name: "",
  wattage: 0,
  quantity: 1,
  hoursPerDay: 0,
  roomCategory: RoomCategory[0],
  iconKey: ApplianceIconKey.at(-1),
};

export const TariffSlab = {
  upto: null,
  rate: 0,
};

export const StateTariff = {
  state: "",
  slabs: [],
  fixedCharge: 0,
  taxPercent: 0,
};

export const ApplianceUsage = {
  id: "",
  name: "",
  roomCategory: RoomCategory[0],
  wattage: 0,
  optimizedWattage: 0,
  dailyUnits: 0,
  monthlyUnits: 0,
  yearlyUnits: 0,
  monthlyCost: 0,
  sharePercent: 0,
};

export const EnergySummary = {
  dailyUnits: 0,
  monthlyUnits: 0,
  yearlyUnits: 0,
  dailyCost: 0,
  monthlyCost: 0,
  yearlyCost: 0,
  effectiveCostPerUnit: 0,
  energyCharge: 0,
  fixedCharge: 0,
  taxAmount: 0,
  applianceBreakdown: [],
  biggestConsumer: null,
  efficientMode: false,
};

export const AppSettings = {
  appliances: [],
  selectedState: "",
  includeTaxes: true,
  starSavings: true,
};
