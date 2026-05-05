export default function EmptyState({ user }) {
  return (
    <div className="text-center py-12  rounded-xl border border-(--border) shadow-md">
      <p className="text-2xl mb-3">🎟️</p>
      <p className="text-sm font-semibold mb-1">
        {user === "new"
          ? "No coupons available for New Users"
          : "No offers available at the moment"}
      </p>
      <p className="text-xs">
        {user === "new"
          ? "Try switching to 'All Users' to see more offers"
          : "Check back later for new deals"}
      </p>
    </div>
  );
}