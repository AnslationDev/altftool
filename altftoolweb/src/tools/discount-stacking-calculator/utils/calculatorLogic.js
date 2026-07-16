/**
 * Core calculation logic for the Discount Stacking Calculator
 */

export const calculateEffectiveSavings = ({
  originalPrice = 0,
  taxRate = 0,
  shippingCharges = 0,
  discounts = [],
  cardOffer = null,
  cashbackRate = 0,
  walletCashback = 0
}) => {
  // 1. Calculate Subtotal with Tax and Shipping
  const taxAmount = (originalPrice * taxRate) / 100;
  let currentPrice = originalPrice + taxAmount + shippingCharges;
  const initialBase = currentPrice;

  let totalSavings = 0;

  // 2. Apply Stacking Discounts (Flat/Sale/Coupon)
  // Discounts are applied sequentially
  discounts.forEach(discount => {
    let saving = 0;
    if (discount.type === 'percentage') {
      saving = (currentPrice * discount.value) / 100;
    } else {
      saving = Math.min(discount.value, currentPrice);
    }
    currentPrice -= saving;
    totalSavings += saving;
  });

  // 3. Apply Card Offer
  let cardSaving = 0;
  if (cardOffer) {
    if (cardOffer.type === 'percentage') {
      cardSaving = (currentPrice * cardOffer.value) / 100;
      if (cardOffer.maxDiscount) {
        cardSaving = Math.min(cardSaving, cardOffer.maxDiscount);
      }
    } else {
      cardSaving = Math.min(cardOffer.value, currentPrice);
    }
    currentPrice -= cardSaving;
    totalSavings += cardSaving;
  }

  // 4. Calculate Cashback (Effective Price reduction but not immediate payable reduction)
  // Usually calculated on the final payable amount after all discounts
  const payableAmount = Math.max(0, currentPrice);
  const percentageCashback = (payableAmount * cashbackRate) / 100;
  const totalCashback = percentageCashback + walletCashback;
  
  // Ensure we don't get a negative effective price
  const effectiveFinalPrice = Math.max(0, payableAmount - totalCashback);
  const absoluteTotalSavings = initialBase - effectiveFinalPrice;
  
  // Cap savings percentage at 100% for standard shopping context
  const effectiveSavingsPercentage = initialBase > 0 
    ? Math.min(100, (absoluteTotalSavings / initialBase) * 100) 
    : 0;

  return {
    initialBase,
    taxAmount,
    payableAmount,
    totalCashback,
    effectiveFinalPrice,
    totalSavings,
    absoluteTotalSavings,
    effectiveSavingsPercentage
  };
};

export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};
