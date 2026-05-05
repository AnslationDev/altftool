"use client";
export default function SelectedSignHeader({ sign, onBack }) {
  return (
    <div className={`${sign.bgColor} rounded-2xl p-4 sm:p-6 mb-6 shadow-lg`}>
      <div className="flex flex-col sm:flex-row items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="mr-4 text-4xl sm:text-6xl">{sign.icon}</div>

          <div>
            <h2
              className={`text-2xl sm:text-4xl font-bold bg-linear-to-r ${sign.color} bg-clip-text text-transparent`}
            >
              {sign.name}
            </h2>

            {/* was text-gray-600 → now theme-safe */}
            <p className="text-(--muted-foreground) text-sm sm:text-base">
              Your cosmic forecast
            </p>
          </div>
        </div>

        {/* RIGHT SIDE BUTTON */}
        <button
          onClick={onBack}
          className="px-4 py-2 bg-(--card) text-(--card-foreground) border border-(--border) rounded-lg shadow hover:shadow-md transition cursor-pointer text-sm sm:text-base"
        >
          Change Sign
        </button>
      </div>
    </div>
  );
}
