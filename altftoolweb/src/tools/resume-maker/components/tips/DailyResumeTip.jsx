import { useMemo } from "react";

const tips = [
  'Use action verbs like "Built", "Optimized", "implemented", and "Lead".',
  "Keep your resume summary short and impactful.",
  "Use measurable achievements instead of generic descriptions.",
  "Add GitHub and LinkedIn links for better credibility.",
  "Tailor your resume keywords according to the job role.",
  "Use clean formatting for better ATS readability.",
  "Highlight projects that solve real-world problems.",
  "Avoid long paragraphs in experience descriptions.",
  "Mention technologies used in each project.",
  "Keep your resume ideally within one page.",
];

const DailyResumeTip = () => {

  // random tip on refresh

  const randomTip = useMemo(() => {
    return tips[Math.floor(Math.random() * tips.length)];
  }, []);

  return (

    <div className="sticky top-0 z-30 mb-4 mt-3">

      <div
        className="
          w-full
          rounded-xl
          border
          border-yellow-200
          bg-gradient-to-r
          from-yellow-50
          to-orange-50
          px-4
          py-2.5
          shadow-sm
        "
      >

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

          {/* ICON */}

          <div className="text-xl shrink-0">
            💡
          </div>

          {/* TEXT */}

          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">

            <span className="font-semibold text-yellow-700">
              Tip of the Day:
            </span>

            <span className="text-gray-700 leading-6">
              {randomTip}
            </span>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyResumeTip;