"use client";

const OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export default function QuestionOptions({
  selected,
  setSelected,
}) {
  return (
    <div className="w-full max-w-3xl mt-12 space-y-4">
      {OPTIONS.map((option, index) => {
        const isSelected = selected === option;

        return (
          <button
            key={index}
            onClick={() => setSelected(option)}
            className={`
              w-full
              rounded-2xl
              border
              px-6
              py-5
              flex
              items-center
              justify-between
              text-left
              group
              transition-all
              duration-200
              hover:-translate-y-[2px]
              ${
                isSelected
                  ? "border-(--primary) bg-(--primary)/10 shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
                  : "border-(--border) hover:border-(--primary)/40 hover:bg-(--primary)/5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)]"
              }
            `}
          >
            <span className="font-semibold text-lg text-(--foreground)">
              {option}
            </span>

            <div
              className={`
                w-7
                h-7
                rounded-full
                border-2
                flex
                items-center
                justify-center
                transition-all
                ${
                  isSelected
                    ? "border-(--primary) bg-(--primary)"
                    : "border-(--border) group-hover:border-(--primary)/50"
                }
              `}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}