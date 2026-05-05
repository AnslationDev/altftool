"use client";
import { Heart, Briefcase, Activity, DollarSign } from "lucide-react";

export default function HoroscopeCategories({ horoscope }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Love */}
      <div className="bg-linear-to-br from-pink-50 to-rose-50 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-pink-100">
        <div className="flex items-center mb-3">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 mr-2" />
          <h4 className="text-base sm:text-xl font-bold text-gray-800">Love</h4>
        </div>
        <p className="text-gray-700 text-sm sm:text-base">
          {horoscope.horoscope_data}
        </p>
      </div>

      {/* Career */}
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-blue-100">
        <div className="flex items-center mb-3">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
          <h4 className="text-base sm:text-xl font-bold text-gray-800">
            Career
          </h4>
        </div>
        <p className="text-gray-700 text-sm sm:text-base">
          Professional opportunities are on the horizon.
        </p>
      </div>

      {/* Health */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-green-100">
        <div className="flex items-center mb-3">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
          <h4 className="text-base sm:text-xl font-bold text-gray-800">
            Health
          </h4>
        </div>
        <p className="text-gray-700 text-sm sm:text-base">
          {horoscope.health || "Prioritize self-care today."}
        </p>
      </div>

      {/* Finance */}
      <div className="bg-linear-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-yellow-100">
        <div className="flex items-center mb-3">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2" />
          <h4 className="text-base sm:text-xl font-bold text-gray-800">
            Finance
          </h4>
        </div>
        <p className="text-gray-700 text-sm sm:text-base">
          Be mindful of spending.
        </p>
      </div>
    </div>
  );
}
