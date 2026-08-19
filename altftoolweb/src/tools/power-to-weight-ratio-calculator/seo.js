const seo = {
  title: "Power to Weight Ratio Calculator: PS/tonne",
  metaDescription:
    "Peak power ÷ mass in PS/tonne, kW/tonne, bhp/tonne, W/kg and kg per PS, at kerb and laden weight, plus a 0-to-target-speed estimate capped by traction.",
  steps: [
    "Enter \"Peak power\" and pick its unit — \"PS (metric hp)\", \"kW\" or \"bhp (imperial hp)\" — then \"Kerb weight (kg)\" and \"Rider, passengers and luggage (kg)\".",
    "Choose a \"Vehicle type\" from Motorcycle, Scooter / step-through, Car (petrol/diesel) or Electric vehicle, and set \"Target speed for 0-to-X (km/h)\".",
    "Read the headline PS/t with load against the kerb figure, then the \"kW per tonne\", \"bhp per tonne\", \"Watts per kg\", \"Weight carried per PS\", estimated 0-to-target time and \"Limiting factor\" rows.",
  ],
  intro:
    "Power-to-weight ratio is peak power divided by the mass being moved, and it predicts acceleration far better than power alone. This calculator reports the ratio in PS per tonne, kW per tonne, bhp per tonne, watts per kilogram and kilograms carried per PS, using both kerb weight and kerb weight plus rider or passengers. It also estimates 0-to-target-speed time from the work-energy relation t = ½mv² ÷ (k × P), floored by the traction limit t = v ÷ (a × g), so an over-powered machine is correctly reported as wheelie-limited rather than impossibly quick.",
  useCases: [
    "Comparing a 24.5 PS, 158 kg 200 cc streetfighter against a 20.2 PS, 195 kg 350 cc classic before choosing between them",
    "Seeing how much a pillion and a 20 kg top box blunt a commuter bike's acceleration",
    "Checking a car listing's claimed 0-100 km/h time against what its quoted power and kerb weight can physically deliver",
  ],
  benefits: [
    ["Five units at once", "PS/tonne, kW/tonne, bhp/tonne, W/kg and kg/PS from a single entry."],
    ["Load included", "Adding the rider changes the number a lot on light vehicles — the calculator shows both."],
    ["Honest limits", "Flags when acceleration is capped by traction rather than by power."],
  ],
  faqs: [
    [
      "What is a good power-to-weight ratio for a motorcycle?",
      "Around 90-105 PS per tonne is normal for a 125 cc commuter or a 350 cc classic, roughly 150-160 for a 200 cc streetfighter, about 260 for a 390 cc naked and close to 1,000 PS per tonne for a litre-class superbike. Above roughly 400 PS per tonne, acceleration from rest is limited by the front wheel lifting, not by power.",
    ],
    [
      "How do you calculate power-to-weight ratio?",
      "Divide peak power by mass, then scale to the unit you want: PS per tonne = power in PS ÷ (mass in kg ÷ 1000). A 43.5 PS bike weighing 167 kg gives 43.5 ÷ 0.167 ≈ 260 PS per tonne at kerb weight, dropping to about 180 with a 75 kg rider aboard.",
    ],
    [
      "Should I include the rider's weight?",
      "Yes, if you want a figure that reflects real acceleration. A 75 kg rider adds nearly 45% to a 167 kg motorcycle's mass, so the laden ratio is the honest one; manufacturers quote the kerb figure because it looks better.",
    ],
    [
      "Why doesn't the estimated 0-100 time match a magazine test?",
      "The estimate uses average delivered power and ignores aerodynamic drag, gearing and tyre temperature, so it typically lands within about 10% of a tested figure. Drag matters most above roughly 120 km/h, and a launch-control start or a cold tyre can move a real result by a second either way.",
    ],
  ],
};

export default seo;
