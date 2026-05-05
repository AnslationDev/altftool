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
  "custom"
];

export const Appliance = {
  id: string,
  name: string,
  wattage: number,
  quantity: number,
  hoursPerDay: number,
  roomCategory: RoomCategory,
  iconKey: ApplianceIconKey
};

export const ApplianceTemplate = {
  name: string,
  wattage: number,
  quantity: number,
  hoursPerDay: number,
  roomCategory: RoomCategory,
  iconKey: ApplianceIconKey
};

export const TariffSlab = {
  upto: number | null,
  rate: number
};

export const StateTariff = {
  state: string,
  slabs: TariffSlab[],
  fixedCharge?: number,
  taxPercent: number
};

export const ApplianceUsage = {
  id: string,
  name: string,
  roomCategory: RoomCategory,
  wattage: number,
  optimizedWattage: number,
  dailyUnits: number,
  monthlyUnits: number,
  yearlyUnits: number,
  monthlyCost: number,
  sharePercent: number
};

export const EnergySummary = {
  dailyUnits: number,
  monthlyUnits: number,
  yearlyUnits: number,
  dailyCost: number,
  monthlyCost: number,
  yearlyCost: number,
  effectiveCostPerUnit: number,
  energyCharge: number,
  fixedCharge: number,
  taxAmount: number,
  applianceBreakdown: ApplianceUsage[],
  biggestConsumer?: ApplianceUsage,
  efficientMode: boolean
};

export const AppSettings = {
  appliances: Appliance[],
  selectedState: string,
  includeTaxes: boolean,
  starSavings: boolean
};
