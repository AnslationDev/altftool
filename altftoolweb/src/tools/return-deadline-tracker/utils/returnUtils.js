/**
 * Utility functions for Return Deadline Tracker
 */

export const RETURN_STATUSES = {
  AVAILABLE: { label: "Return Available", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  REQUESTED: { label: "Return Requested", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  SCHEDULED: { label: "Pickup Scheduled", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  PICKED_UP: { label: "Pickup Completed", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  REFUND_PENDING: { label: "Refund Pending", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  REFUNDED: { label: "Refunded", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  EXCHANGE_REQUESTED: { label: "Exchange Requested", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  EXCHANGE_COMPLETED: { label: "Exchange Completed", color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20" },
  EXPIRED: { label: "Expired", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

export const PRODUCT_CATEGORIES = [
  "Electronics", "Clothing", "Home & Kitchen", "Beauty & Health", "Books", "Toys", "Sports", "Other"
];

export const calculateRemainingDays = (deadlineDate) => {
  if (!deadlineDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getUrgencyLevel = (remainingDays) => {
  if (remainingDays === null) return 'none';
  if (remainingDays < 0) return 'expired';
  if (remainingDays <= 3) return 'high';
  if (remainingDays <= 7) return 'medium';
  return 'low';
};

export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusIcon = (status) => {
  // This will be used with Lucide icons in the main component
  return status;
};
