/**
 * Utility functions for Cart Bill Splitter
 */

/**
 * Formats a number as currency
 */
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Calculates the total breakdown for each user
 */
export const calculateTotals = (users, items, charges) => {
  // Initialize breakdown for each user
  const userBreakdown = {};
  users.forEach((user) => {
    userBreakdown[user.id] = {
      id: user.id,
      name: user.name,
      subtotal: 0,
      charges: 0,
      total: 0,
      paid: user.paid || 0,
    };
  });

  // Calculate subtotal for each user based on items
  items.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const owners = item.ownerIds || [];

    if (owners.length === 0) return;

    if (item.splitType === "percentage") {
      owners.forEach((ownerId) => {
        const percentage = parseFloat(item.splits?.[ownerId]) || 0;
        const share = (price * percentage) / 100;
        if (userBreakdown[ownerId]) {
          userBreakdown[ownerId].subtotal += share;
        }
      });
    } else if (item.splitType === "quantity") {
      const totalQty = owners.reduce((acc, ownerId) => acc + (parseFloat(item.splits?.[ownerId]) || 0), 0);
      if (totalQty > 0) {
        owners.forEach((ownerId) => {
          const qty = parseFloat(item.splits?.[ownerId]) || 0;
          const share = (price / totalQty) * qty;
          if (userBreakdown[ownerId]) {
            userBreakdown[ownerId].subtotal += share;
          }
        });
      }
    } else if (item.splitType === "exact") {
      owners.forEach((ownerId) => {
        const amount = parseFloat(item.splits?.[ownerId]) || 0;
        if (userBreakdown[ownerId]) {
          userBreakdown[ownerId].subtotal += amount;
        }
      });
    } else {
      // Equal split
      const share = price / owners.length;
      owners.forEach((ownerId) => {
        if (userBreakdown[ownerId]) {
          userBreakdown[ownerId].subtotal += share;
        }
      });
    }
  });

  // Calculate global totals
  const totalSubtotal = Object.values(userBreakdown).reduce((acc, u) => acc + u.subtotal, 0);

  // Distribute global charges (tax, delivery, etc.) proportionally to subtotals
  charges.forEach((charge) => {
    const value = parseFloat(charge.value) || 0;
    let chargeAmount = 0;

    if (charge.type === "percentage") {
      chargeAmount = (totalSubtotal * value) / 100;
    } else {
      chargeAmount = value;
    }

    if (totalSubtotal > 0) {
      Object.keys(userBreakdown).forEach((userId) => {
        const userSubtotal = userBreakdown[userId].subtotal;
        const userChargeShare = (userSubtotal / totalSubtotal) * chargeAmount;
        userBreakdown[userId].charges += userChargeShare;
      });
    }
  });

  // Calculate final totals for each user
  Object.keys(userBreakdown).forEach((userId) => {
    userBreakdown[userId].total = userBreakdown[userId].subtotal + userBreakdown[userId].charges;
  });

  return Object.values(userBreakdown);
};

/**
 * Calculates who owes whom to settle the bill
 */
export const calculateSettlement = (userBreakdowns) => {
  // Calculate balance for each user: Paid - TotalOwed
  // Positive balance means they are owed money
  // Negative balance means they owe money
  let balances = userBreakdowns.map((u) => ({
    id: u.id,
    name: u.name,
    amount: (u.paid || 0) - u.total,
  }));

  const settlements = [];

  // Separate into creditors (owed money) and debtors (owe money)
  let creditors = balances.filter((b) => b.amount > 0.01).sort((a, b) => b.amount - a.amount);
  let debtors = balances.filter((b) => b.amount < -0.01).sort((a, b) => a.amount - b.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountOwed = Math.abs(debtor.amount);
    const amountCredited = creditor.amount;

    const settlementAmount = Math.min(amountOwed, amountCredited);

    settlements.push({
      from: debtor.name,
      fromId: debtor.id,
      to: creditor.name,
      toId: creditor.id,
      amount: settlementAmount,
    });

    debtor.amount += settlementAmount;
    creditor.amount -= settlementAmount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  return settlements;
};
