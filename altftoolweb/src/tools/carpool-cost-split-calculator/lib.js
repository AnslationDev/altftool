/**
 * Carpool cost sharing.
 *
 * Two kinds of cost are treated differently, because they behave differently:
 *
 *  - Running cost (fuel + wear) is proportional to distance, so it is split by
 *    person-kilometres: how far each rider is actually in the car.
 *  - Fixed cost per trip (tolls, parking) does not change with who is aboard,
 *    so it is split equally between everyone in the car.
 *
 * Running cost per km = fuel price / fuel efficiency + wear allowance per km.
 */

/**
 * Wear allowance covers tyres, servicing, brake pads and depreciation caused by
 * running the vehicle. It is a per-kilometre figure you set yourself, because it
 * depends entirely on the vehicle - the default here is a mid-range estimate for
 * a hatchback or sedan and should be replaced with your own service history.
 */
export const DEFAULT_WEAR_PER_KM = 2;

export const MAX_RIDERS = 8;

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Running cost of one kilometre: fuel plus the wear allowance. */
export function costPerKm({ fuelPricePerL, fuelEfficiencyKmPerL, wearPerKm }) {
  if (!(fuelEfficiencyKmPerL > 0)) return null;
  return fuelPricePerL / fuelEfficiencyKmPerL + wearPerKm;
}

/**
 * @param {object} input
 * @param {number} input.routeDistanceKm  one-way length of the full route
 * @param {boolean} input.roundTrip       the car does the route both ways each day
 * @param {number} input.tripsPerMonth    days the carpool runs each month
 * @param {number} input.fuelPricePerL
 * @param {number} input.fuelEfficiencyKmPerL
 * @param {number} input.wearPerKm
 * @param {number} input.tollPerTrip
 * @param {number} input.parkingPerTrip
 * @param {Array<{id:string,name:string,km:number,isDriver:boolean}>} input.riders
 * @param {boolean} input.driverPaysShare false means passengers cover the driver's share too
 */
export function computeCarpool({
  routeDistanceKm,
  roundTrip = true,
  tripsPerMonth = 22,
  fuelPricePerL,
  fuelEfficiencyKmPerL,
  wearPerKm = DEFAULT_WEAR_PER_KM,
  tollPerTrip = 0,
  parkingPerTrip = 0,
  riders = [],
  driverPaysShare = true,
}) {
  const route = Number(routeDistanceKm);
  const trips = Number(tripsPerMonth);
  const price = Number(fuelPricePerL);
  const efficiency = Number(fuelEfficiencyKmPerL);
  const wear = Number(wearPerKm);
  const toll = Number(tollPerTrip);
  const parking = Number(parkingPerTrip);

  if (![route, trips, price, efficiency, wear, toll, parking].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for distance, fuel, tolls and parking." };
  }
  if (route <= 0 || route > 2000) {
    return { error: "One-way route distance must be between 1 km and 2000 km." };
  }
  if (!(efficiency > 0)) {
    return { error: "Fuel efficiency must be greater than zero km per litre." };
  }
  if (efficiency > 200) {
    return { error: "Fuel efficiency above 200 km/l is out of range." };
  }
  if (price < 0 || wear < 0 || toll < 0 || parking < 0) {
    return { error: "Fuel price, wear, tolls and parking cannot be negative." };
  }
  if (!Number.isInteger(trips) || trips < 1 || trips > 62) {
    return { error: "Trips per month must be a whole number between 1 and 62." };
  }
  if (!Array.isArray(riders) || riders.length === 0) {
    return { error: "Add at least one rider." };
  }
  if (riders.length > MAX_RIDERS) {
    return { error: `This calculator handles up to ${MAX_RIDERS} riders.` };
  }

  const cleaned = [];
  for (const rider of riders) {
    const km = Number(rider.km);
    if (!Number.isFinite(km)) {
      return { error: `Enter a distance in kilometres for ${rider.name || "every rider"}.` };
    }
    if (km <= 0) {
      return { error: `${rider.name || "Every rider"} must travel more than zero kilometres.` };
    }
    if (km > route) {
      return {
        error: `${rider.name || "A rider"} cannot travel ${km} km on a ${route} km route.`,
      };
    }
    cleaned.push({ ...rider, km });
  }

  const drivers = cleaned.filter((rider) => rider.isDriver);
  if (drivers.length !== 1) {
    return { error: "Mark exactly one rider as the driver." };
  }

  const passengers = cleaned.filter((rider) => !rider.isDriver);
  if (!driverPaysShare && passengers.length === 0) {
    return { error: "With no passengers the driver has to carry the full cost." };
  }

  const legs = roundTrip ? 2 : 1;
  const perKm = costPerKm({ fuelPricePerL: price, fuelEfficiencyKmPerL: efficiency, wearPerKm: wear });
  const tripDistanceKm = route * legs;
  const runningCostPerTrip = tripDistanceKm * perKm;
  const fixedCostPerTrip = toll + parking;
  const tripCost = runningCostPerTrip + fixedCostPerTrip;

  const personKm = cleaned.map((rider) => rider.km * legs);
  const totalPersonKm = personKm.reduce((sum, value) => sum + value, 0);
  if (!(totalPersonKm > 0)) {
    return { error: "Total person-kilometres came to zero — check the rider distances." };
  }

  const fixedShare = fixedCostPerTrip / cleaned.length;

  let shares = cleaned.map((rider, index) => ({
    id: rider.id,
    name: rider.name,
    isDriver: rider.isDriver,
    km: rider.km,
    personKm: round(personKm[index], 2),
    runningShare: (runningCostPerTrip * personKm[index]) / totalPersonKm,
    fixedShare,
  }));

  let driverShareBeforeWaiver = 0;
  if (!driverPaysShare) {
    const driverIndex = shares.findIndex((rider) => rider.isDriver);
    driverShareBeforeWaiver = shares[driverIndex].runningShare + shares[driverIndex].fixedShare;
    const passengerPersonKm = shares
      .filter((rider) => !rider.isDriver)
      .reduce((sum, rider) => sum + rider.personKm, 0);

    shares = shares.map((rider) => {
      if (rider.isDriver) return { ...rider, runningShare: 0, fixedShare: 0 };
      const extra = (driverShareBeforeWaiver * rider.personKm) / passengerPersonKm;
      return { ...rider, runningShare: rider.runningShare + extra };
    });
  }

  const breakdown = shares.map((rider) => {
    const perTrip = rider.runningShare + rider.fixedShare;
    return {
      id: rider.id,
      name: rider.name,
      isDriver: rider.isDriver,
      km: rider.km,
      personKm: rider.personKm,
      sharePct: round((perTrip / tripCost) * 100, 1),
      perTrip: round(perTrip, 2),
      perMonth: round(perTrip * trips, 0),
    };
  });

  const driver = breakdown.find((rider) => rider.isDriver);
  const soloCostPerTrip = tripCost;

  return {
    costPerKm: round(perKm, 2),
    fuelCostPerKm: round(price / efficiency, 2),
    wearPerKm: round(wear, 2),
    tripDistanceKm: round(tripDistanceKm, 1),
    runningCostPerTrip: round(runningCostPerTrip, 2),
    fixedCostPerTrip: round(fixedCostPerTrip, 2),
    tripCost: round(tripCost, 2),
    monthlyCost: round(tripCost * trips, 0),
    fuelLitresPerTrip: round(tripDistanceKm / efficiency, 2),
    totalPersonKm: round(totalPersonKm, 1),
    breakdown,
    driverPaysShare,
    driverSavingPerTrip: round(soloCostPerTrip - (driver ? driver.perTrip : 0), 2),
    driverSavingPerMonth: round((soloCostPerTrip - (driver ? driver.perTrip : 0)) * trips, 0),
    soloCostPerTrip: round(soloCostPerTrip, 2),
    soloCostPerMonth: round(soloCostPerTrip * trips, 0),
  };
}
