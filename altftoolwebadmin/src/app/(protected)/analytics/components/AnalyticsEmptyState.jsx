export default function AnalyticsEmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Analytics data is not ready yet</h2>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        The analytics route is connected, but there are no analyzable records or audit
        events available yet. Once modules start writing timestamps and activity, this
        dashboard will populate automatically.
      </p>
    </div>
  );
}
