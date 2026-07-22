const info = {
  "ohms-law-calculator": {
    intro: [
      "Ohm's Law describes the relationship between voltage, current and resistance in an electrical circuit. It states that the current flowing through a conductor is directly proportional to the voltage across it and inversely proportional to its resistance.",
      "Enter any two of the three quantities and the calculator solves for the remaining one and the power dissipated. It is the core tool for sizing resistors, checking circuit currents and verifying supply voltages.",
    ],
    formula: {
      expression: "V = I × R      P = V × I = I² × R = V² ÷ R",
      where: [
        ["V", "Voltage across the component, in volts (V)"],
        ["I", "Current through the component, in amperes (A)"],
        ["R", "Resistance, in ohms (Ω)"],
        ["P", "Power dissipated, in watts (W)"],
      ],
      note: "From any two known values the other two follow: with V and I, R = V ÷ I; with V and R, I = V ÷ R; with I and R, V = I × R.",
    },
    howToUse: [
      "Fill in exactly two of the three fields: voltage, current or resistance.",
      "Leave the value you want to find blank.",
      "Read the solved quantity, plus the power, in the solution panel.",
      "Clear a field and enter a different pair to solve a new arrangement.",
    ],
    goodToKnow: [
      "Ohm's Law applies to ohmic (linear) components; diodes, transistors and lamps are non-ohmic and only follow it approximately.",
      "Power (heat) rises with the square of current, so doubling the current quadruples the heat dissipated in a resistor.",
      "Always choose a resistor whose power rating exceeds the calculated wattage, with margin, to avoid overheating.",
    ],
    faqs: [
      { q: "Why do I need to enter exactly two values?", a: "Ohm's Law links three quantities through one equation, so knowing any two fixes the third. Entering three would over-constrain the problem, and entering one leaves it unsolvable." },
      { q: "What if the current comes out very small?", a: "That is normal for high resistances on low voltages — for example 12 V across 100 kΩ gives only 0.12 mA. The calculator shows extra decimals so small currents remain readable." },
      { q: "Is this valid for AC circuits?", a: "For purely resistive AC loads, use RMS values of voltage and current and the same equations hold. Reactive loads (capacitors, inductors, motors) need impedance and power-factor corrections that this calculator does not model." },
      { q: "How is power related to Ohm's Law?", a: "Power is the rate of energy use, P = V × I. Substituting V = I × R gives P = I² × R, and I = V ÷ R gives P = V² ÷ R, so power can be found from any two of the three quantities." },
    ],
  },

  "electricity-cost-calculator": {
    intro: [
      "This calculator estimates how much an electrical appliance costs to run. It converts the appliance's power rating and how long you use it into energy in kilowatt-hours (kWh), then multiplies by your electricity tariff.",
      "Use it to compare appliances, judge the impact of an always-on device, or budget a monthly electricity bill for a single load.",
    ],
    formula: {
      expression: "Energy (kWh) = Power (W) ÷ 1000 × Hours/day × Days      Cost = Energy × Rate",
      where: [
        ["Power", "Appliance rating, in watts (W)"],
        ["Hours/day", "Hours the appliance runs each day"],
        ["Days", "Number of days in the period"],
        ["Rate", "Tariff per unit, in ₹ per kWh"],
      ],
      note: "One kilowatt-hour (unit) is 1000 watts running for one hour. Dividing watts by 1000 converts the power to kilowatts before multiplying by time.",
    },
    howToUse: [
      "Enter the appliance's power in watts (check the label or nameplate).",
      "Enter how many hours per day it runs and over how many days.",
      "Enter your electricity rate per kWh from your bill.",
      "Read the energy consumed and the cost per day and for the whole period.",
    ],
    goodToKnow: [
      "Appliances rated in amps can be converted to watts with Power = Volts × Amps (e.g. 5 A at 230 V = 1150 W).",
      "Motors, ACs and fridges cycle on and off, so use average running hours rather than the total time they are switched on.",
      "Standby (phantom) loads of a few watts add up over a full month because they draw power 24 hours a day.",
    ],
    faqs: [
      { q: "Where do I find an appliance's wattage?", a: "It is usually printed on a rating label, the nameplate, or in the manual. If only current and voltage are given, multiply them: watts = volts × amps." },
      { q: "What is a kWh or 'unit'?", a: "A kilowatt-hour is the energy used by a 1000 W appliance running for one hour. Electricity bills charge per kWh, which utilities often call a 'unit'." },
      { q: "Does a higher-wattage appliance always cost more?", a: "Not necessarily — cost depends on wattage and running time together. A 2000 W kettle used for 5 minutes can cost far less than a 40 W bulb left on all day." },
      { q: "Why might my estimate differ from the actual bill?", a: "Real usage hours vary, tariffs can be tiered or include fixed charges and taxes, and thermostat-controlled devices do not draw full power continuously. Treat the result as a close estimate." },
    ],
  },

  "resistor-color-code-calculator": {
    intro: [
      "Resistors use coloured bands to encode their resistance and tolerance. This calculator decodes 4-band and 5-band resistors: choose the colour of each band and it computes the resistance in ohms and the tolerance range.",
      "It is handy when a resistor's value is not printed numerically, or to check a component before soldering it into a circuit.",
    ],
    formula: {
      expression: "Resistance = (significant digits) × multiplier",
      where: [
        ["Digits", "First bands give the significant figures (2 for 4-band, 3 for 5-band)"],
        ["Multiplier", "Next band multiplies by a power of ten (gold ×0.1, silver ×0.01)"],
        ["Tolerance", "Final band gives the ± percentage accuracy"],
      ],
      note: "Colour → digit: black 0, brown 1, red 2, orange 3, yellow 4, green 5, blue 6, violet 7, grey 8, white 9. The multiplier band is 10 raised to that digit.",
    },
    howToUse: [
      "Select whether the resistor has 4 or 5 bands.",
      "Set the colour of each digit band from the end lead inward.",
      "Choose the multiplier band and the tolerance band.",
      "Read the resistance (with k/M scaling) and its minimum–maximum range.",
    ],
    goodToKnow: [
      "5-band resistors have three digit bands and are used for precision (1% and tighter) values.",
      "Read the bands from the end with the group of bands closest to a lead; the tolerance band (often gold or silver) sits nearest the other end.",
      "Tolerance colours: brown ±1%, red ±2%, green ±0.5%, blue ±0.25%, violet ±0.1%, gold ±5%, silver ±10%.",
    ],
    faqs: [
      { q: "Which end do I start reading from?", a: "Start from the band closest to a lead — the digit bands are grouped at one end and the tolerance band is set slightly apart at the other. If unsure, the gold or silver band is almost always the tolerance and goes last." },
      { q: "What is the difference between 4-band and 5-band?", a: "A 4-band resistor uses two significant digits plus a multiplier and tolerance. A 5-band resistor adds a third significant digit for greater precision, common in 1% and better resistors." },
      { q: "What do gold and silver multipliers mean?", a: "As a multiplier, gold means ×0.1 and silver means ×0.01, which produce sub-ohm resistances. As the final band they instead mean ±5% and ±10% tolerance." },
      { q: "How accurate is a resistor's stated value?", a: "The tolerance band gives the guaranteed range. A 1 kΩ ±5% resistor can measure anywhere from 950 Ω to 1050 Ω and still be in spec, which is why the calculator shows the min and max." },
    ],
  },

  "speed-calculator": {
    intro: [
      "The speed calculator relates speed, distance and time. Given any two of them it finds the third, so you can work out average speed, how far you will travel, or how long a journey will take.",
      "It uses average speed over the whole trip and assumes consistent units — kilometres for distance and hours for time, giving speed in kilometres per hour.",
    ],
    formula: {
      expression: "speed = distance ÷ time      distance = speed × time      time = distance ÷ speed",
      where: [
        ["speed", "Average speed, in kilometres per hour (km/h)"],
        ["distance", "Distance travelled, in kilometres (km)"],
        ["time", "Duration of travel, in hours (h)"],
      ],
      note: "To convert km/h to metres per second divide by 3.6; the calculator shows the m/s equivalent when solving for speed.",
    },
    howToUse: [
      "Enter exactly two of the three values: speed, distance or time.",
      "Leave the unknown field blank.",
      "Read the solved value, with all three shown together for reference.",
      "Keep units consistent — kilometres and hours give km/h.",
    ],
    goodToKnow: [
      "This is average speed; it does not account for stops, acceleration or changes in pace during the trip.",
      "Time is in decimal hours — 90 minutes is 1.5 hours, not 1.30.",
      "For metres and seconds the same equations work; just interpret the answer as metres per second.",
    ],
    faqs: [
      { q: "How do I enter 1 hour 30 minutes?", a: "Convert the minutes to a decimal fraction of an hour: 30 minutes is 0.5, so enter 1.5 hours. 15 minutes is 0.25, and 45 minutes is 0.75." },
      { q: "Is this instantaneous or average speed?", a: "It is average speed over the full distance and time you enter. Actual speed at any moment can be higher or lower." },
      { q: "Can I use miles instead of kilometres?", a: "Yes — the maths is unit-agnostic as long as you are consistent. Enter distance in miles and time in hours and the speed will be in miles per hour, though the labels will still read km." },
      { q: "Why can't I enter all three values?", a: "The three quantities are linked by one equation, so any two determine the third. Entering two and leaving one blank tells the calculator which to solve for." },
    ],
  },

  "power-calculator": {
    intro: [
      "This calculator finds electrical power from the quantities you know. Choose whether you have voltage and current, current and resistance, or voltage and resistance, and it returns the power in watts and kilowatts.",
      "Power is the rate at which electrical energy is converted to heat, light or motion, and knowing it is essential for sizing wiring, fuses, resistors and power supplies.",
    ],
    formula: {
      expression: "P = V × I      P = I² × R      P = V² ÷ R",
      where: [
        ["P", "Power, in watts (W)"],
        ["V", "Voltage, in volts (V)"],
        ["I", "Current, in amperes (A)"],
        ["R", "Resistance, in ohms (Ω)"],
      ],
      note: "All three forms come from combining P = V × I with Ohm's Law (V = I × R); pick the one matching the values you have.",
    },
    howToUse: [
      "Pick which two quantities you know from the toggle.",
      "Enter the two required values.",
      "Read the resulting power in watts and kilowatts.",
      "Switch modes to recalculate from a different pair of quantities.",
    ],
    goodToKnow: [
      "1 kilowatt (kW) is 1000 watts; power supplies and appliances are commonly rated in watts or kilowatts.",
      "Because P = I² × R, current has an outsized effect on heating — halving the current cuts resistive power loss to a quarter.",
      "For AC circuits with reactive loads, true power (W) is less than apparent power (VA) by the power factor.",
    ],
    faqs: [
      { q: "Which formula should I use?", a: "Use the one that matches your known values: P = V × I for voltage and current, P = I² × R for current and resistance, and P = V² ÷ R for voltage and resistance. All give the same answer for the same circuit." },
      { q: "What is the difference between watts and volt-amperes?", a: "Watts measure real power that does useful work; volt-amperes (VA) measure apparent power. In purely resistive circuits they are equal, but reactive AC loads make VA larger than watts." },
      { q: "How does power relate to energy cost?", a: "Power (in kW) multiplied by running time (in hours) gives energy in kWh, which is what your electricity tariff charges for. Use the electricity cost calculator to turn watts into rupees." },
      { q: "Why does resistance cause heat?", a: "When current flows through resistance, electrical energy is dissipated as heat at a rate P = I² × R. This is why undersized wires and overloaded resistors get hot and can fail." },
    ],
  },
};

export default info;
