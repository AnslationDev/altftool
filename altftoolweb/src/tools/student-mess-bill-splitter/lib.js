/**
 * Mess Bill Splitter for students.
 *
 * The standard hostel/mess rebate model:
 *   - FIXED charges (cook's salary, gas cylinder, rent of utensils, wifi) do
 *     not depend on attendance, so they are split EQUALLY among all members.
 *   - The VARIABLE part (groceries / per-day mess food cost) is split in
 *     proportion to each member's days present ("mess days"), the same way
 *     hostel messes compute per-day rates and absence rebates.
 *
 *   memberShare = fixed / n + variable × (daysPresent_i / totalDaysPresent)
 *
 * Paise reconciliation: shares are rounded to 2 decimals and the rounding
 * remainder is applied to the last member so the shares always sum exactly
 * to the bill.
 */

/** Round to 2 decimal places (paise). */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @param {object} input
 * @param {number} input.totalBill     Full bill for the period (INR).
 * @param {number} [input.fixedCharges] Portion of the bill that is fixed
 *                                      (salary, gas, wifi). 0 = split fully by days.
 * @param {Array<{name?: string, daysPresent: number}>} input.members
 * @returns {{perDayRate:number|null, fixedPerMember:number, variableTotal:number,
 *   totalDays:number, shares:Array<{name:string,daysPresent:number,fixedShare:number,
 *   variableShare:number,total:number}>, checkTotal:number}|{error:string}}
 */
export function splitMessBill({ totalBill, fixedCharges = 0, members }) {
  const bill = Number(totalBill);
  if (!Number.isFinite(bill) || bill < 0) {
    return { error: "Total bill must be zero or a positive number." };
  }

  const fixed = Number(fixedCharges);
  if (!Number.isFinite(fixed) || fixed < 0) {
    return { error: "Fixed charges must be zero or a positive number." };
  }
  if (fixed > bill) {
    return { error: "Fixed charges cannot exceed the total bill." };
  }

  if (!Array.isArray(members) || members.length === 0) {
    return { error: "Add at least one member." };
  }

  const cleaned = [];
  let totalDays = 0;
  for (let i = 0; i < members.length; i += 1) {
    const raw = members[i] ?? {};
    const name =
      typeof raw.name === "string" && raw.name.trim() !== "" ? raw.name.trim() : `Member ${i + 1}`;
    const days = Number(raw.daysPresent);
    if (!Number.isFinite(days) || days < 0) {
      return { error: `${name}: days present must be zero or a positive number.` };
    }
    if (!Number.isInteger(days)) {
      return { error: `${name}: days present must be a whole number.` };
    }
    if (days > 366) {
      return { error: `${name}: days present cannot exceed 366.` };
    }
    totalDays += days;
    cleaned.push({ name, daysPresent: days });
  }

  const variableTotal = bill - fixed;
  if (variableTotal > 0 && totalDays === 0) {
    return {
      error:
        "No one has any days present, but there is a variable amount to split — enter days or move the whole bill into fixed charges.",
    };
  }

  const n = cleaned.length;
  const fixedPerMember = fixed / n;
  const perDayRate = totalDays > 0 ? variableTotal / totalDays : null;

  // Exact shares, then round with last-member reconciliation so the sum matches the bill.
  // total is derived from the already-rounded fixedShare/variableShare (not the raw
  // sum, rounded separately) so fixedShare + variableShare always equals total for
  // every member, not just the one that gets the final paisa-remainder adjustment.
  const shares = cleaned.map((member) => {
    const variableShare = totalDays > 0 ? variableTotal * (member.daysPresent / totalDays) : 0;
    const roundedFixedShare = round2(fixedPerMember);
    const roundedVariableShare = round2(variableShare);
    return {
      name: member.name,
      daysPresent: member.daysPresent,
      fixedShare: roundedFixedShare,
      variableShare: roundedVariableShare,
      total: round2(roundedFixedShare + roundedVariableShare),
    };
  });

  const roundedSum = shares.reduce((sum, share) => sum + share.total, 0);
  const remainder = round2(bill - roundedSum);
  if (remainder !== 0 && shares.length > 0) {
    const last = shares[shares.length - 1];
    // Apply the remainder to whichever component it conceptually belongs to:
    // the variable (food) share if this member actually has a variable
    // portion, otherwise the fixed share. This keeps fixedShare + variableShare
    // equal to total for every member, including the reconciled one.
    const lastHasVariable = variableTotal > 0 && last.daysPresent > 0;
    if (lastHasVariable) {
      last.variableShare = round2(last.variableShare + remainder);
    } else {
      last.fixedShare = round2(last.fixedShare + remainder);
    }
    last.total = round2(last.fixedShare + last.variableShare);
  }

  return {
    perDayRate,
    fixedPerMember: round2(fixedPerMember),
    variableTotal: round2(variableTotal),
    totalDays,
    shares,
    checkTotal: round2(shares.reduce((sum, share) => sum + share.total, 0)),
  };
}
