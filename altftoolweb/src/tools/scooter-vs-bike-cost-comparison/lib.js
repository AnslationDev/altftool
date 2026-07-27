/**
 * Scooter versus motorcycle, on total cost of ownership.
 *
 * The purchase price is the smallest part of the answer. Over a holding period
 * of N years and K kilometres, the money actually spent is:
 *
 *   depreciation = on-road price - resale value at the end
 *   fuel         = (K / km-per-litre) x fuel price
 *   servicing    = number of services x cost per service
 *   tyres        = number of replacement sets x cost per set
 *   insurance    = annual premium x N
 *   TCO          = the sum of those five
 *
 * SERVICING follows the manual's rule of "every X km or Y months, whichever
 * comes first", so the count is the larger of the distance-based and the
 * time-based number — a lightly ridden scooter still needs its oil changed.
 *
 * TYRES are counted as completed replacements: at 40,000 km on a tyre life of
 * 20,000 km you buy two more sets, not three, because the set fitted at the
 * factory is already paid for in the price.
 *
 * BREAK-EVEN DISTANCE answers the real question — which one wins at YOUR annual
 * mileage. Splitting each machine into a fixed cost (depreciation plus
 * insurance) and a smoothed variable cost per kilometre:
 *
 *      variable per km = fuel price / km-per-litre
 *                      + service cost / service interval
 *                      + tyre set cost / tyre life
 *
 * the two lines cross at K = (fixedB - fixedA) / (varA - varB). Above that
 * distance the cheaper-to-run machine wins however much more it costs to buy.
 * That crossing point uses smoothed service and tyre costs rather than the
 * stepped counts, so it is a guide to the region, not a rupee-exact threshold.
 */

const MAX_PRICE = 10_000_000;
const MAX_ANNUAL_KM = 200_000;
const MAX_YEARS = 25;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Cost of ownership for one machine.
 * @param {object} vehicle
 * @param {number} annualKm
 * @param {number} years
 * @param {number} fuelPrice
 */
export function vehicleCost(vehicle, annualKm, years, fuelPrice) {
  const totalKm = annualKm * years;
  const months = years * 12;

  const litres = totalKm / vehicle.kmpl;
  const fuel = litres * fuelPrice;

  const servicesByDistance = Math.floor(totalKm / vehicle.serviceIntervalKm);
  const servicesByTime = Math.floor(months / vehicle.serviceIntervalMonths);
  const services = Math.max(servicesByDistance, servicesByTime);
  const servicing = services * vehicle.serviceCost;

  const tyreSets = Math.floor(totalKm / vehicle.tyreLifeKm);
  const tyres = tyreSets * vehicle.tyreSetCost;

  const insurance = vehicle.annualInsurance * years;

  const resaleValue = (vehicle.onRoadPrice * vehicle.resalePct) / 100;
  const depreciation = vehicle.onRoadPrice - resaleValue;

  const total = depreciation + fuel + servicing + tyres + insurance;

  // Fixed and smoothed-variable split, used for the break-even distance.
  const fixed = depreciation + insurance;
  const variablePerKm =
    fuelPrice / vehicle.kmpl +
    vehicle.serviceCost / vehicle.serviceIntervalKm +
    vehicle.tyreSetCost / vehicle.tyreLifeKm;

  return {
    id: vehicle.id,
    name: vehicle.name,
    totalKm,
    litres,
    fuel,
    services,
    servicing,
    tyreSets,
    tyres,
    insurance,
    resaleValue,
    depreciation,
    total,
    perKm: totalKm > 0 ? total / totalKm : null,
    perMonth: months > 0 ? total / months : null,
    perYear: years > 0 ? total / years : null,
    fixed,
    variablePerKm,
  };
}

function validateVehicle(vehicle, label) {
  const numbers = [
    vehicle.onRoadPrice,
    vehicle.kmpl,
    vehicle.serviceCost,
    vehicle.serviceIntervalKm,
    vehicle.serviceIntervalMonths,
    vehicle.tyreSetCost,
    vehicle.tyreLifeKm,
    vehicle.annualInsurance,
    vehicle.resalePct,
  ];
  if (!numbers.every(isNum)) return `${label}: enter a valid number in every field.`;
  if (vehicle.onRoadPrice <= 0) return `${label}: enter the on-road price.`;
  if (vehicle.onRoadPrice > MAX_PRICE)
    return `${label}: enter an on-road price of ${MAX_PRICE.toLocaleString("en-IN")} or less.`;
  if (vehicle.kmpl <= 0) return `${label}: mileage must be greater than zero km per litre.`;
  if (vehicle.kmpl > 200) return `${label}: enter a mileage of 200 km per litre or less.`;
  if (vehicle.serviceIntervalKm <= 0) return `${label}: the service interval in km must be greater than zero.`;
  if (vehicle.serviceIntervalMonths <= 0)
    return `${label}: the service interval in months must be greater than zero.`;
  if (vehicle.tyreLifeKm <= 0) return `${label}: tyre life must be greater than zero km.`;
  if ([vehicle.serviceCost, vehicle.tyreSetCost, vehicle.annualInsurance].some((value) => value < 0))
    return `${label}: costs cannot be negative.`;
  if (vehicle.resalePct < 0 || vehicle.resalePct > 100)
    return `${label}: resale value must be between 0% and 100% of the on-road price.`;
  return null;
}

/**
 * @param {object} input
 * @param {object} input.scooter  vehicle spec
 * @param {object} input.bike     vehicle spec
 * @param {number} input.annualKm kilometres ridden a year
 * @param {number} input.years    how long you will keep it
 * @param {number} input.fuelPrice pump price per litre
 */
export function compareTwoWheelers({ scooter, bike, annualKm, years, fuelPrice }) {
  if (![annualKm, years, fuelPrice].every(isNum))
    return { error: "Enter a valid number for annual distance, years and fuel price." };
  if (annualKm <= 0) return { error: "Annual distance must be greater than zero." };
  if (annualKm > MAX_ANNUAL_KM)
    return { error: `Enter an annual distance of ${MAX_ANNUAL_KM.toLocaleString("en-IN")} km or less.` };
  if (years <= 0) return { error: "The holding period must be at least one year." };
  if (years > MAX_YEARS) return { error: `Enter a holding period of ${MAX_YEARS} years or less.` };
  if (fuelPrice < 0) return { error: "Fuel price cannot be negative." };

  const scooterError = validateVehicle(scooter, scooter.name || "Scooter");
  if (scooterError) return { error: scooterError };
  const bikeError = validateVehicle(bike, bike.name || "Motorcycle");
  if (bikeError) return { error: bikeError };

  const a = vehicleCost(scooter, annualKm, years, fuelPrice);
  const b = vehicleCost(bike, annualKm, years, fuelPrice);

  const cheaper = a.total <= b.total ? a : b;
  const dearer = a.total <= b.total ? b : a;
  const difference = dearer.total - cheaper.total;
  const differencePerMonth = difference / (years * 12);

  // Where the two total-cost lines cross, in total kilometres.
  const varGap = a.variablePerKm - b.variablePerKm;
  let breakEven = null;
  if (Math.abs(varGap) > 1e-9) {
    const km = (b.fixed - a.fixed) / varGap;
    if (km > 0) {
      breakEven = {
        totalKm: km,
        annualKm: km / years,
        cheaperBelow: varGap > 0 ? a.name : b.name,
        cheaperAbove: varGap > 0 ? b.name : a.name,
      };
    }
  }

  const notes = [];
  notes.push(
    `Over ${years} year${years === 1 ? "" : "s"} and ${Math.round(a.totalKm).toLocaleString("en-IN")} km, "${cheaper.name}" costs ${Math.round(difference).toLocaleString("en-IN")} rupees less — about ${Math.round(differencePerMonth).toLocaleString("en-IN")} a month.`,
  );
  if (breakEven) {
    notes.push(
      `The two even out at roughly ${Math.round(breakEven.annualKm).toLocaleString("en-IN")} km a year. Below that "${breakEven.cheaperBelow}" is cheaper overall; above it "${breakEven.cheaperAbove}" pulls ahead, because the cheaper running cost has more distance to work on.`,
    );
  } else {
    notes.push(
      "Both machines cost the same per kilometre to run, so the purchase price and resale decide it at any distance.",
    );
  }
  const deprShareA = (a.depreciation / a.total) * 100;
  const deprShareB = (b.depreciation / b.total) * 100;
  notes.push(
    `Depreciation is ${Math.round(Math.max(deprShareA, deprShareB))}% of the bigger bill here. Resale assumptions move the answer more than fuel does, so check real listings for the models you are choosing between.`,
  );
  notes.push(
    "Not everything here is money: a scooter's step-through frame, underseat storage and automatic gearbox suit short urban trips, while a motorcycle's gearing, wheels and seating suit long highway runs. Price it, then ride both.",
  );

  return {
    scooter: a,
    bike: b,
    cheaperName: cheaper.name,
    cheaperTotal: cheaper.total,
    difference,
    differencePerMonth,
    breakEven,
    years,
    annualKm,
    notes,
  };
}
