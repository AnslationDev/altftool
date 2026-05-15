"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Brain,
} from "lucide-react";

import { questions } from "../data/questions";

export default function ResultPage() {
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    const savedAnswers = questions.filter((q) => {
      const saved = window.localStorage.getItem(
        `personality-question-${q.id}`
      );

      return saved;
    }).length;

    setTotalAnswered(savedAnswers);
  }, []);

  const progress = Math.round(
    (totalAnswered / questions.length) * 100
  );

  return (
    <section
      className="
        min-h-screen
        personality-bg
        px-3
        sm:px-4
        py-6
        sm:py-10
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          relative
          w-full
          max-w-3xl
          overflow-hidden
          rounded-[24px]
          sm:rounded-[28px]
          md:rounded-[32px]
          border
          border-(--border)
          bg-(--background)
          shadow-[0_10px_60px_rgba(0,0,0,0.08)]
        "
      >
        {/* TOP GRADIENT */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-36
            sm:h-44
            md:h-52
            bg-gradient-to-b
            from-(--primary)/10
            to-transparent
          "
        />

        <div
          className="
            relative
            z-10
            px-4
            py-6
            sm:px-6
            sm:py-8
            md:px-10
            md:py-12
          "
        >
          {/* ICON */}
          <div className="flex justify-center">
            <div
              className="
                w-20
                h-20
                sm:w-24
                sm:h-24
                rounded-full
                bg-(--primary)/10
                border
                border-(--primary)/20
                flex
                items-center
                justify-center
                shadow-lg
              "
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-(--primary)" />
            </div>
          </div>

          {/* BADGE */}
          <div className="mt-5 sm:mt-6 flex justify-center">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-(--primary)/20
                bg-(--primary)/10
                px-3
                sm:px-4
                py-2
                text-[12px]
                sm:text-sm
                font-medium
                text-(--primary)
              "
            >
              <Sparkles className="w-4 h-4" />

              Personality Assessment Complete
            </div>
          </div>

          {/* HEADING */}
          <div className="mt-6 text-center">
            <h1
              className="
                text-[28px]
                sm:text-4xl
                md:text-5xl
                font-bold
                tracking-tight
                leading-[1.1]
                px-2
              "
            >
              Test Completed
            </h1>

            <p
              className="
              mt-2
                md:mt-4
                text-sm
                sm:text-base
                md:text-lg
                leading-relaxed
                text-(--muted-foreground)
                max-w-2xl
                mx-auto
                px-2
              "
            >
              Thank you for completing the personality test.
              Your responses have been successfully recorded.
            </p>
          </div>

          {/* STATS */}
          <div
            className="
              mt-8
              sm:mt-10
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >
            {/* ANSWERED */}
            <div
              className="
                rounded-2xl
                border
                border-(--border)
                bg-(--background)
                p-4
                sm:p-5
                md:p-6
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    w-10
                    h-10
                    sm:w-12
                    sm:h-12
                    rounded-xl
                    bg-green-500/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>

                <div>
                  <p className="text-sm text-(--muted-foreground)">
                    Questions Answered
                  </p>

                  <h3 className="mt-1 text-xl sm:text-2xl font-bold">
                    {totalAnswered}/{questions.length}
                  </h3>
                </div>
              </div>
            </div>

            {/* COMPLETION */}
            <div
              className="
                rounded-2xl
                border
                border-(--border)
                bg-(--background)
                p-4
                sm:p-5
                md:p-6
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    w-10
                    h-10
                    sm:w-12
                    sm:h-12
                    rounded-xl
                    bg-(--primary)/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-(--primary)" />
                </div>

                <div>
                  <p className="text-sm text-(--muted-foreground)">
                    Completion Rate
                  </p>

                  <h3 className="mt-1 text-xl sm:text-2xl font-bold">
                    {progress}%
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Assessment Progress
              </span>

              <span className="text-sm text-(--muted-foreground)">
                {progress}%
              </span>
            </div>

            <div className="h-2.5 sm:h-3 overflow-hidden rounded-full bg-(--border)">
              <div
                className="
                  h-full
                  rounded-full
                  bg-(--primary)
                  transition-all
                  duration-700
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* INFO BOX */}
          <div
            className="
              mt-6
              sm:mt-8
              rounded-2xl
              border
              border-(--border)
              bg-(--muted-foreground)/10
              p-4
              sm:p-5
            "
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-(--primary) mt-0.5 shrink-0" />

              <p
                className="
                  text-[12px]
                  md:text-base
                  text-(--muted-foreground)
                  leading-relaxed
                "
              >
                Your responses remain private and secure.
                This assessment helps analyze your personality
                traits and behavioral preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
