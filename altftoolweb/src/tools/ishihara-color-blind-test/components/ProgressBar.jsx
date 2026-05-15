export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm font-medium text-(--secondary-foreground)">
        <span>Progress</span>
        <span>{current} of {total} Plates</span>
      </div>
      <div className="w-full h-3 bg-(--muted) rounded-full overflow-hidden border border-(--border)">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
