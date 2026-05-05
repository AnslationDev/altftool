export default function LoadingSpinner() {
  return (
    <div className="text-center py-10">
      <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-(--primary) rounded-full animate-spin mb-4"></div>
      <p className="description">Analyzing image...</p>
    </div>
  );
}