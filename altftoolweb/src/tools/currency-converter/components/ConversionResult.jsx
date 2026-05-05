"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import Loader from "./Loader";

const ConversionResult = ({
  loading,
  convertedAmount,
  exchangeRate,
  fromCurrency,
  toCurrency,
}) => {
  return (
    <div className="w-full max-w-full mt -2 sm:mt-4 p-3 sm:p-4 md:p-6 lg:p-7 rounded-2xl shadow-lg border border-(--border) bg-(--card) text-(--card-foreground) space-y-4 transition-colors">

      {/* Header */}
      <h2 className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold text-(--primary)">
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-(--primary)" />
        <span className="truncate">Conversion Result</span>
      </h2>

      {/* Loader or Results */}
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">

          {/* Converted Amount */}
          <div className="w-full">
            <p className="text-xs sm:text-sm text-(--muted-foreground)">
              Total Converted
            </p>

            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">

              {/* Amount */}
              <span className="font-extrabold text-(--primary) drop-shadow-lg leading-none break-words text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                {convertedAmount !== null
                  ? convertedAmount.toFixed(2)
                  : "---"}
              </span>

              {/* Currency */}
              <span className="font-semibold text-(--foreground) text-sm sm:text-lg md:text-xl lg:text-2xl">
                {toCurrency}
              </span>

            </div>
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="pt-4 border-t border-(--border)">

              <p className="text-xs sm:text-sm font-medium text-(--primary)">
                Exchange Rate (1 {fromCurrency} → {toCurrency})
              </p>

              <p className="mt-1 font-mono break-words text-xs sm:text-sm md:text-base lg:text-lg text-(--foreground)">
                1 {fromCurrency} =
                <span className="text-(--primary) font-semibold ml-1">
                  {exchangeRate.toFixed(6)}
                </span>{" "}
                {toCurrency}
              </p>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ConversionResult;