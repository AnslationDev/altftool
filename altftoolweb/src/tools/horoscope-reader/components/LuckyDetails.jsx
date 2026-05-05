"use client";

export default function LuckyDetails({ sign, horoscope, timeframe }) {
  const isMonthly =
    horoscope.standout_days || horoscope.challenging_days || horoscope.month;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mt-5 mb-5bg-(--card) text-(--card-foreground)">
      {/* DAILY DATA */}
      {horoscope.lucky_number && (
        <div
          className={`bg-(--card) text-(--card-foreground) border border-(--border)  rounded-xl p-3 sm:p-4`}
        >
          <div className="mb-1 text-xs sm:text-sm text-(--muted-foreground)">
            Lucky Number
          </div>

          <div
            className={`bg-clip-text text-transparent text-2xl font-bold sm:text-3xl ${sign.color}`}
          >
            {horoscope.lucky_number}
          </div>
        </div>
      )}

      {horoscope.lucky_color && (
        <div
          className={`bg-(--card) text-(--card-foreground) border border-(--border)  rounded-xl p-3 sm:p-4`}
        >
          <div className="mb-1 text-xstext-(--muted-foreground) sm:text-sm">
            Lucky Color
          </div>

          <div className="flex items-center">
            <div
              className="mr-2 h-6 w-6 rounded-full sm:h-8 sm:w-8 border border-(--border)"
              style={{ backgroundColor: horoscope.lucky_color.toLowerCase() }}
            ></div>

            <div className="text-base font-semibold capitalize text-(--foreground) sm:text-lg">
              {horoscope.lucky_color}
            </div>
          </div>
        </div>
      )}

      {horoscope.lucky_time && (
        <div
          className={`bg-(--card) text-(--card-foreground) border border-(--border)  rounded-xl p-3 sm:p-4`}
        >
          <div className="mb-1 text-xs text-muted-foreground sm:text-sm">
            Lucky Time
          </div>

          <div className="text-base font-semibold text-foreground sm:text-lg">
            {horoscope.lucky_time}
          </div>
        </div>
      )}

      {/* MONTHLY DATA */}
      {isMonthly && (
        <>
          {horoscope.standout_days && (
            <div
              className={`bg-(--card) text-(--card-foreground) border border-(--border) rounded-xl p-3 sm:p-4`}
            >
              <div className="mb-1 text-xs text-(--muted-foreground) sm:text-sm">
                Standout Days
              </div>

              <div className="text-base font-semibold text-(--foreground) sm:text-lg">
                {horoscope.standout_days}
              </div>
            </div>
          )}

          {horoscope.challenging_days && (
            <div
              className={`bg-(--card) text-(--card-foreground) border border-(--border) rounded-xl p-3 sm:p-4`}
            >
              <div className="mb-1 text-xs text-(--muted-foreground) sm:text-sm">
                Challenging Days
              </div>

              <div className="text-base font-semibold text-(--foreground) sm:text-lg">
                {horoscope.challenging_days}
              </div>
            </div>
          )}

          {horoscope.month && (
            <div
              className={`bg-(--card) text-(--card-foreground) border border-(--border) rounded-xl p-3 sm:p-4`}
            >
              <div className="mb-1 text-xs text-(--muted-foreground) sm:text-sm">
                Month
              </div>

              <div className="text-base font-semibold text-(--foreground) sm:text-lg">
                {horoscope.month}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
