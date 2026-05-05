// utils/calculateTotal.js

/**
 * Calculate total price of an order with percentage discount
 * @param {Object} params
 * @param {number} params.price - Price of a single item
 * @param {number} params.quantity - Number of items
 * @param {number} params.shipping - Shipping cost
 * @param {number} params.discount - Discount in percentage (e.g., 10 for 10%)
 * @returns {string} - Total amount formatted to 2 decimal places
 */
export const calculateTotal = ({ price, quantity, shipping, discount }) => {
  const subtotal = price * quantity;

  // Discount in percentage
  const discountAmount = (subtotal * discount) / 100;

  const total = subtotal - discountAmount + shipping;

  return total.toFixed(2);
};